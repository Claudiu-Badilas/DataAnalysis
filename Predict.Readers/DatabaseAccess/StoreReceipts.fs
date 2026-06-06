namespace Predict.DatabaseAccess

open System
open Predict.DatabaseAccess.StorerUtils
open Predict.Types.ReceiptTypes
open Predict.Common.Configuration
open Predict.Repository.ReceiptRepo.Models
open Predict.Repository.ReceiptRepo

module StoreReceipts =

    let filterDublicates (storedReceiptsIds: Receipt list) (receipts: Receipt list) =
        receipts
        |> List.filter (fun r -> not (storedReceiptsIds |> List.exists (fun sr -> r.Identifier = sr.Identifier)))


    let getQuantityTypeId quantityType =
        match quantityType with
        | Some quantityType ->
            match quantityType with
            | QuantityType.BUC -> Nullable(1)
            | QuantityType.KG -> Nullable(2)
        | _ -> Nullable()


    let mapPurchasedProducts (products: ParsedPurchasedProduct option list) =
        products
        |> List.map (fun p ->
            new PurchasedProduct(
                Name = p.Value.Name.Value,
                Price = StorerUtils.getNullableFloatFromOption p.Value.Price,
                Quantity = StorerUtils.getNullableFloatFromOption p.Value.Quantity,
                VAT = StorerUtils.getNullableFloatFromOption p.Value.VAT,
                QuantityTypeId = getQuantityTypeId p.Value.QuantityType
            ))

    let mapPurchasedProduct (product: PurchasedProduct) receiptId =
        new PurchasedProduct(
            Name = product.Name,
            Price = product.Price,
            Quantity = product.Quantity,
            VAT = product.VAT,
            QuantityTypeId = product.QuantityTypeId,
            ReceiptId = receiptId
        )


    let storeReceipts dataOwnerId (parsedReceipts: ParsedReceipt list) =
        let envConfig = EnvironmentConfiguration()
        let receiptRepo = new ReceiptRepo(EnvironmentConfiguration())

        let receipts =
            parsedReceipts
            |> List.map (fun r ->
                new Receipt(
                    Identifier = r.Identifier.Value,
                    Date = StorerUtils.getNullableDateTimeFromOption r.Date,
                    TotalPrice = StorerUtils.getNullableFloatFromOption r.TotalPrice,
                    TotalDiscount = StorerUtils.getNullableFloatFromOption r.TotalDiscount,
                    Products = mapPurchasedProducts r.ParsedProducts,
                    CurrencyId = StorerUtils.getCurrencyTypeId r.Currency,
                    ProviderId = StorerUtils.getProviderId r.Provider,
                    DataOwnerId = dataOwnerId
                ))

        let storedReceiptsIds =
            receiptRepo.GetReceiptByUserId(dataOwnerId)
            |> Async.AwaitTask
            |> Async.RunSynchronously
            |> Seq.toList

        let filteredReceipts = filterDublicates storedReceiptsIds receipts

        let storingResp =
            receiptRepo.StoreReceipts(filteredReceipts)
            |> Async.AwaitTask
            |> Async.RunSynchronously

        let allStoredReceiptsIds =
            receiptRepo.GetReceiptByUserId dataOwnerId
            |> Async.AwaitTask
            |> Async.RunSynchronously
            |> Seq.toList

        let purchasedProducts =
            filteredReceipts
            |> List.map (fun receipt ->
                let foundReceipt =
                    allStoredReceiptsIds
                    |> List.find (fun storedReceipt -> receipt.Identifier = storedReceipt.Identifier)

                receipt.Products
                |> Seq.toList
                |> List.map (fun product -> mapPurchasedProduct product foundReceipt.Id))
            |> List.concat

        let storingResponse =
            receiptRepo.StorePurchasedProducts(purchasedProducts)
            |> Async.AwaitTask
            |> Async.RunSynchronously

        storingResponse
