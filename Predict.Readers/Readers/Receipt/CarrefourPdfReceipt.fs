namespace Predict.Reader.ReceiptParser

open System
open Predict.Types.ReceiptTypes
open Predict.Utils
open System.Text.RegularExpressions
open iTextSharp.text.pdf
open Predict.Types.CommonTypes
open Predict.Utils.ParserUtils
open Predict.DatabaseAccess

module CarrefourPdfReceipt =

    let getQuantyType quantityType =
        match quantityType with
        | "buc" -> QuantityType.BUC
        | "kg" -> QuantityType.KG
        | _ -> QuantityType.BUC


    let popLastElementOfList list =
        let popped = List.last list
        let newList = List.take (List.length list - 1) list
        popped, newList


    let getValue text value =
        let result = Regex.Match(text, "(" + value + ")[\s]*(.*)")

        match Seq.length result.Groups with
        | 3 -> (result.Groups[Seq.length result.Groups - 1]).Value |> Some
        | _ -> None


    let getParsedProducts (text: string) =
        let lines = text.Split([| "\n" |], StringSplitOptions.None)

        lines
        |> Array.indexed
        |> Array.map (fun (i, line) ->
            let result = Regex.Match(line.Trim(), "([0-9.]+)( |)([buckg]+)( x |)([0-9.]+)")

            match result.Success && Seq.length result.Groups = 6 with
            | true ->
                let nextLine = if (i + 1) < lines.Length then lines[i + 1] else ""
                let words = nextLine.Trim().Split(" ") |> Array.toList
                let vatType, words = popLastElementOfList words

                let vat =
                    getValue text ("TVA " + vatType)
                    |> Option.bind (fun v ->
                        let percentValue = v.Split(" ")[0]
                        percentValue.Substring(0, percentValue.Length - 1) |> Some)
                    |> ParserUtils.tryGetDouble

                let _, words = popLastElementOfList words

                Some
                    { Name = List.fold (fun acc x -> acc + " " + x) "" words |> Some
                      Quantity = result.Groups[1].Value |> Some |> ParserUtils.tryGetDouble
                      QuantityType = result.Groups[3].Value |> getQuantyType
                      VAT = vat
                      Price = result.Groups[5].Value |> Some |> ParserUtils.tryGetDouble }
            | _ -> None)
        |> Array.filter (fun p -> p.IsSome)
        |> Array.toList


    let getReceipt (pdf: PdfReader) userId : ParsedReceipt option =
        try
            let text = PdfUtils.getTextFromPdf pdf
            let products = getParsedProducts text

            let dateAndTime =
                getValue text "Data:" |> Option.bind (fun v -> v.Trim().Split("ORA:") |> Some)

            let dateTime =
                DateTimeUtils.convertStringToUTCDate
                    (dateAndTime.Value[0].Trim() + " " + dateAndTime.Value[1].Trim() |> Some)
                    "dd/MM/yyyy HH-mm-ss"

            let provider = Provider.CARREFOUR |> Some
            let total = getValue text "SUBTOTAL" |> ParserUtils.tryGetDouble

            { Identifier = generateReceiptUniqueId userId dateTime total provider
              Date = dateTime
              TotalPrice = total
              TotalDiscount =
                getValue text "economisit"
                |> Option.bind (fun v -> v.Split(" ")[0] |> Some)
                |> ParserUtils.tryGetDouble
              Currency = CurrencyType.RON |> Some
              ParsedProducts = products
              Provider = provider }
            |> Some
        with e ->
            None


    let readPdfs dataOwnerId (pdfs: PdfReader list) =
        let parsedTransaction =
            pdfs
            |> List.choose (fun pdf -> getReceipt pdf dataOwnerId)
            |> List.distinctBy (fun t -> t.Identifier)

        StoreReceipts.storeReceipts dataOwnerId parsedTransaction
