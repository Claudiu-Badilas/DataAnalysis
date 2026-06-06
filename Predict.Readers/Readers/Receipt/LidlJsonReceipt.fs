namespace Predict.Reader.ReceiptParser

open Predict.Types.CommonTypes
open Predict.DatabaseAccess
open System
open System.IO
open System.Text.Json
open Predict.Types.ReceiptTypes


type ProviderDetails =
    { Name: string
      Address: string
      TaxId: string }

type LidlParsedPurchasedProduct =
    { Name: string
      Price: double
      Quantity: double
      QuantityType: string
      VAT: double }


type LidlParsedReceipt =
    { Identifier: string
      Date: DateTime
      TotalPrice: double
      TotalDiscount: double
      Currency: string
      ParsedProducts: LidlParsedPurchasedProduct list
      ProviderDetails: ProviderDetails option }


module LidlJsonReceipt =


    let getLocalJsons path =
        Directory.EnumerateFiles(path, "*.json")
        |> Seq.toList
        |> List.map File.ReadAllText

    let getReceiptFromJson (jsonContent: string) (userId: int) : LidlParsedReceipt list =
        try
            let options = JsonSerializerOptions()
            options.PropertyNameCaseInsensitive <- true

            // Try to parse as array first
            let allReceipts = JsonSerializer.Deserialize<JsonElement>(jsonContent)

            if allReceipts.ValueKind = JsonValueKind.Array then
                let validReceipts = System.Collections.Generic.List<LidlParsedReceipt>()

                for receiptElement in allReceipts.EnumerateArray() do
                    try
                        let receipt =
                            JsonSerializer.Deserialize<LidlParsedReceipt>(receiptElement.GetRawText(), options)

                        validReceipts.Add(receipt)
                    with ex ->
                        printfn "Skipping one receipt: %s" ex.Message

                Seq.toList validReceipts
            else
                []
        with ex ->
            printfn "Error: %s" ex.Message
            []

    let mapLidlReceiptToParsedReceipt (lidReceipt: LidlParsedReceipt) : ParsedReceipt =
        { Identifier = Some lidReceipt.Identifier
          Date = Some lidReceipt.Date
          TotalPrice = Some lidReceipt.TotalPrice
          TotalDiscount = Some lidReceipt.TotalDiscount
          Currency =
            match lidReceipt.Currency with
            | "EUR" -> Some EUR
            | "USD" -> Some USD
            | _ -> Some RON
          ParsedProducts =
            lidReceipt.ParsedProducts
            |> List.map (fun p ->
                Some
                    { Name = Some p.Name
                      Price = Some p.Price
                      Quantity = Some p.Quantity
                      QuantityType =
                        match p.QuantityType with
                        | "BUC" -> Some BUC
                        | "KG" -> Some KG
                        | _ -> None
                      VAT = Some p.VAT })
          Provider = Provider.LIDL |> Some }

    let readJsons (jsonPath: string) (userId: int) =
        let files = getLocalJsons jsonPath

        let parsedTransactions =
            files
            |> List.collect (fun json -> getReceiptFromJson json userId)
            |> List.map mapLidlReceiptToParsedReceipt

        if List.isEmpty parsedTransactions then
            printfn "No receipts found"
            []
        else
            StoreReceipts.storeReceipts userId parsedTransactions
            parsedTransactions
