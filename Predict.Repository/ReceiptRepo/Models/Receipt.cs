namespace Predict.Repository.ReceiptRepo.Models;

public class Receipt {
    public int? Id { get; set; }
    public string Identifier { get; set; }
    public DateTime? Date { get; set; }
    public double? TotalPrice { get; set; }
    public double? TotalDiscount { get; set; }
    public IEnumerable<PurchasedProduct> Products { get; set; }
    public string Currency { get; set; }
    public string Provider { get; set; }
    public int DataOwnerId { get; set; }
}

public class PurchasedProduct {
    public string Name { get; set; }
    public double? Price { get; set; }
    public double? Quantity { get; set; }
    public double? VAT { get; set; }
    public string QuantityType { get; set; }
    public int? ReceiptId { get; set; }
}