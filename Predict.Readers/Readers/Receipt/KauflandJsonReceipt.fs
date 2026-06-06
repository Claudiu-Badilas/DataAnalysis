namespace Predict.Reader.ReceiptParser

open Predict.Types.CommonTypes
open Predict.DatabaseAccess
open System
open System.IO
open System.Text.Json
open Predict.Types.ReceiptTypes

type KauflandParsedPurchasedProduct =
    { Name: string
      Price: double
      Quantity: double
      QuantityType: string
      VAT: double }


type KauflandParsedReceipt =
    { Identifier: string
      Date: DateTime
      TotalPrice: double
      TotalDiscount: double
      Currency: string
      ParsedProducts: KauflandParsedPurchasedProduct list}


module KauflandJsonReceipt =


    let getLocalJsons path =
        Directory.EnumerateFiles(path, "*.json")
        |> Seq.toList
        |> List.map File.ReadAllText

    let getReceiptFromJson (jsonContent: string) (userId: int) : KauflandParsedReceipt list =
        try
            let options = JsonSerializerOptions()
            options.PropertyNameCaseInsensitive <- true

            // Try to parse as array first
            let allReceipts = JsonSerializer.Deserialize<JsonElement>(jsonContent)

            if allReceipts.ValueKind = JsonValueKind.Array then
                let validReceipts = System.Collections.Generic.List<KauflandParsedReceipt>()

                for receiptElement in allReceipts.EnumerateArray() do
                    try
                        let receipt =
                            JsonSerializer.Deserialize<KauflandParsedReceipt>(receiptElement.GetRawText(), options)

                        validReceipts.Add(receipt)
                    with ex ->
                        printfn "Skipping one receipt: %s" ex.Message

                Seq.toList validReceipts
            else
                []
        with ex ->
            printfn "Error: %s" ex.Message
            []

    let mapLidlReceiptToParsedReceipt (lidReceipt: KauflandParsedReceipt) : ParsedReceipt =
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
                        | "buc" -> Some BUC
                        | "kg" -> Some KG
                        | _ -> None
                      VAT = Some p.VAT })
          Provider = Provider.KAUFLAND |> Some }

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
