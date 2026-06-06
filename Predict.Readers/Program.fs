open System.IO
open IronXL
open iTextSharp.text.pdf
open Predict.Readers.AccountStatement
open Predict.Reader.ReceiptParser
open System

module ParserConsole =

    let getLocalExcels path =
        Directory.EnumerateFiles(path, "*.xlsx")
        |> Seq.append (Directory.EnumerateFiles(path, "*.xls"))
        |> Seq.toList
        |> List.map (fun f -> Path.Combine(path, f) |> WorkBook.Load)


    let getLocalPdfs path =
        Directory.EnumerateFiles(path, "*.pdf")
        |> Seq.toList
        |> List.map (fun f -> new PdfReader(Path.Combine(path, f)))


    let getLocalCsvs path =
        Directory.EnumerateFiles(path, "*.csv")
        |> Seq.toList
        |> List.map (fun f -> new StreamReader(f))

    let getLocalJsons path =
        Directory.EnumerateFiles(path, "*.json")
        |> Seq.toList
        |> List.map (fun f -> new StreamReader(f))

    type Data =
        { Calorie: double option
          Distance: double option
          Segment: double option
          Speed: double option
          Start_time: double option }

    [<EntryPoint>]
    let main _ =
        let dataOwnerId = 1

        let path = @"D:\Projects\PredictFiles"

        //let raifExcels = getLocalExcels @$"{path}\AccountStatements\Raiffaisen"
        //let raitransactions = RaiffeisenExcelAccountStatement.readExcels dataOwnerId raifExcels

        //let raifExcels = getLocalExcels @$"{path}\"
        //let raitransactions = RaiffeisenExcelAccountStatement.readExcels dataOwnerId raifExcels

        //let revExcels = getLocalExcels @$"{path}\"
        //let revtransactions = RevolutExcelAccountStatement.readExcels dataOwnerId revExcels

        //let omPdfs = getLocalPdfs @$"{path}\"
        //let omtransactions = OrangeMoneyPdfAccountStatement.readPdfs dataOwnerId omPdfs

        //let carrPdfs = getLocalPdfs @$"{path}\Receipts\Carrefour"
        //let carrReceipts = CarrefourPdfReceipt.readPdfs dataOwnerId carrPdfs


        //let lidlReceipts = LidlJsonReceipt.readJsons @$"{path}\Receipts\Lidl" dataOwnerId
        let kauflandReceipts = KauflandJsonReceipt.readJsons @$"{path}\Receipts\Kaufland" dataOwnerId

        printfn "Run succesfully"
        0
