namespace Predict.Readers.AccountStatement

open IronXL
open System.Text.RegularExpressions
open Predict.Types.TransactionTypes
open Predict.Types.CommonTypes
open Predict.Utils
open Predict.DatabaseAccess
open Predict.Repository.TransactionRepo.Models
open Predict.DatabaseAccess.StorerUtils
open System.IO

module RaiffeisenExcelAccountStatement =

    let DATE_REGEX =
        @"^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$"


    let checkDescriptionByText (description: string) (text: string) : string list =
        description.Split("|")
        |> Array.toList
        |> List.filter (fun d -> d.Contains(text))


    let getTranasctionType
        (debit: double option)
        (credit: double option)
        (description: string)
        : TransactionType option =
        let splitedDescription =
            checkDescriptionByText description "Transfer intre conturi proprii"

        match debit, credit, splitedDescription.IsEmpty with
        | Some d, None, true -> TransactionType.SPEND |> Some
        | None, Some c, true -> TransactionType.RECEIVED |> Some
        | _, _, false -> TransactionType.INTERNAL_TRANSFER |> Some
        | _, _, _ -> TransactionType.UNDEFINED |> Some


    let getAmount debit credit =
        match debit, credit with
        | Some debit, None -> debit * -1.0 |> Some
        | None, Some credit -> credit |> Some
        | _, _ -> None


    let getTransactions (excel: WorkBook) userId : ParsedTransaction list =
        let values = ExcelUtils.getExcelValues excel
        values
        |> Seq.toList
        |> List.indexed
        |> List.choose (fun (i, row) ->
            let date = row[0]

            match date with
            | null -> None
            | _ ->
                match Regex.IsMatch(date, DATE_REGEX) with
                | false -> None
                | _ ->
                    let debit = row[2] |> Some |> ParserUtils.tryGetDouble
                    let credit = row[3] |> Some |> ParserUtils.tryGetDouble

                    let description =
                        try
                            row[11]
                        with _ ->
                            row[10]

                    let registrationDate =
                        DateTimeUtils.convertStringToUTCDate (date |> Some) "dd/MM/yyyy"

                    Some
                        { Identifier = None
                          RegistrationDate = registrationDate
                          CompletionDate = DateTimeUtils.convertStringToUTCDate (row[1] |> Some) "dd/MM/yyyy"
                          Amount = getAmount debit credit
                          Fee = None
                          Currency = CurrencyType.RON |> Some
                          Description = description |> Some
                          TransactionType = getTranasctionType debit credit description
                          ReferenceId = None
                          Provider = Provider.RAIFFEISEN |> Some })
        |> List.groupBy (fun t -> t.RegistrationDate, t.Amount)
        |> List.map (fun (_, t) -> ParserUtils.mapTransactions t userId)
        |> List.concat
        //|> List.distinctBy (fun t -> t.Identifier)


    let readExcels dataOwnerId (excels: WorkBook list) =
        let parsedTransaction =
            excels
            |> List.map (fun excel -> getTransactions excel dataOwnerId)
            |> List.concat
            |> List.distinctBy (fun t -> t.Identifier)

        StoreTransactions.storeTransaction dataOwnerId parsedTransaction


    let getLocalExcels path =
        Directory.EnumerateFiles(path, "*.xlsx")
        |> Seq.append (Directory.EnumerateFiles(path, "*.xls"))
        |> Seq.toList
        |> List.map (fun f -> Path.Combine(path, f) |> WorkBook.Load)

    
    let getTransactionsFromExcels dataOwnerId path =
        let excels = getLocalExcels path
        let parsedTransactions =
            excels
            |> List.map (fun excel -> getTransactions excel dataOwnerId)
            |> List.concat
            //|> List.distinctBy (fun t -> t.Identifier)

        let transactions =
            parsedTransactions
            |> List.map (fun t ->
                new TransactionResponse(
                    RegistrationDate = StorerUtils.getNullableDateTimeFromOption t.RegistrationDate,
                    CompletionDate = StorerUtils.getNullableDateTimeFromOption t.CompletionDate,
                    ReferenceId = StorerUtils.getNullableIntFromOption t.ReferenceId,
                    Amount = StorerUtils.getNullableFloatFromOption t.Amount,
                    Fee = StorerUtils.getNullableFloatFromOption t.Fee,
                    Provider = t.Provider.Value.ToString(),
                    Description = t.Description.Value,
                    DataOwnerId = dataOwnerId
                ))
        transactions

    let basePath = @$""
    let transactionsPath = @$"{basePath}\AccountStatements\Raiffaisen2\Economii"

    let transactions () = getTransactionsFromExcels 1 transactionsPath
    let economii () = getTransactionsFromExcels 1 @$"{transactionsPath}\Economii"
