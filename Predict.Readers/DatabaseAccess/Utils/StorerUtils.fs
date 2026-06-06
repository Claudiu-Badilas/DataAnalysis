namespace Predict.DatabaseAccess.StorerUtils

open System
open Predict.Types.TransactionTypes
open Predict.Types.CommonTypes

module StorerUtils =

    let getCurrencyTypeId currency =
        match currency with
        | Some currency ->
            match currency with
            | CurrencyType.EUR -> Nullable(1)
            | CurrencyType.USD -> Nullable(2)
            | CurrencyType.RON -> Nullable(3)
        | _ -> Nullable()


    let getProviderId provider =
        match provider with
        | Some provider ->
            match provider with
            | Provider.RAIFFEISEN -> Nullable(1)
            | Provider.REVOLUT -> Nullable(2)
            | Provider.ORANGE_MONEY -> Nullable(3)
            | Provider.CARREFOUR -> Nullable(4)
            | Provider.KAUFLAND -> Nullable(5)
            //| Provider.ZEPP_LIFE -> Nullable(6)
            | Provider.LIDL -> Nullable(7)
        | _ -> Nullable()


    let getNullableIntFromOption (value: int option) =
        match value.IsSome with
        | true -> Nullable value.Value
        | _ -> Nullable()


    let getNullableFloatFromOption (value: float option) =
        match value.IsSome with
        | true -> Nullable value.Value
        | _ -> Nullable()


    let getNullableDateTimeFromOption (value: DateTime option) =
        match value.IsSome with
        | true -> Nullable value.Value
        | _ -> Nullable()

    let getNullableBooleanFromOption (value: bool option) =
        match value.IsSome with
        | true -> Nullable true
        | _ -> Nullable false
