using Dapper;
using Predict.Common.Configuration;
using Npgsql;
using Predict.Repository.ReceiptRepo.Models;
using Predict.Repository.ReceiptRepo.Models.Response;

namespace Predict.Repository.ReceiptRepo;

public class ReceiptRepo : IReceiptRepo {

    private readonly string _npsqlConnectionString;

    public ReceiptRepo(IEnvironmentConfiguration envConfig) {
        _npsqlConnectionString = envConfig.GetNpsqlConnectionString();
    }

    public ReceiptRepo(string npsqlConnectionString) {
        _npsqlConnectionString = npsqlConnectionString;
    }

    public async Task<IEnumerable<Receipt>> GetReceiptByUserId(int dataOwnerId) {
        using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
            connection.Open();
            var sql = @"
                    SELECT 
                        id as Id,
                        identifier as Identifier
                    FROM public.receipt
                    WHERE data_owner_id = @dataOwnerId;";

            return await connection.QueryAsync<Receipt>(sql, new { dataOwnerId });
        };
    }

    public async Task<List<ReceiptResponse>> GetReceipts(DateTime startDate, DateTime endDate) {
        using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
            connection.Open();
            var sql = @"
                    SELECT
	                    r.id as Id,
	                    r.receipt_date as Date,
	                    r.total_price as TotalPrice,
	                    r.total_discount as TotalDiscout,
	                    r.description as Description,
	                    r.provider as Provider,
	                    r.currency as currency
                    FROM public.receipt r
                    ORDER BY r.receipt_date desc;";

            return (await connection.QueryAsync<ReceiptResponse>(sql, new { startDate, endDate })).ToList();
        };
    }

    public async Task<IEnumerable<PurchasedProductResponse>> GetPurchedProductsByReceiptsIds(List<int> receiptIds) {
        using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
            connection.Open();
            var sql = @"
                    SELECT 
                        pp.id as Id, 
                        pp.""name"" as Name, 
                        pp.price as Price, 
                        pp.vat as VAT, 
                        pp.quantity as Quantity, 
                        pp.quantity_type as QuantityType, 
                        pp.receipt_id as ReceiptId
                    FROM public.purchased_product pp
                    WHERE pp.receipt_id = ANY(@receiptIds);";

            return await connection.QueryAsync<PurchasedProductResponse>(sql, new { receiptIds });
        };
    }

    public async Task<int> StoreReceipts(IEnumerable<Receipt> receipts) {
        await using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
            var sql = @"
                    INSERT INTO public.receipt
                        (identifier, ""receipt_date"", total_price, total_discount, provider, currency, data_owner_id)
                    VALUES (
                        unnest(@identifiers),
                        unnest(@dates),
                        unnest(@total_prices),
                        unnest(@total_discounts),
                        unnest(@provider),
                        unnest(@currency),
                        unnest(@data_owner_ids)
                    )";

            return await connection.ExecuteScalarAsync<int>(sql, new {
                identifiers = receipts.Select(x => x.Identifier).ToList(),
                dates = receipts.Select(x => x.Date).ToList(),
                total_prices = receipts.Select(x => x.TotalPrice).ToList(),
                total_discounts = receipts.Select(x => x.TotalDiscount).ToList(),
                provider = receipts.Select(x => x.Provider).ToList(),
                currency = receipts.Select(x => x.Currency).ToList(),
                data_owner_ids = receipts.Select(x => x.DataOwnerId).ToList()
            });
        }
    }

    public async Task<int> StorePurchasedProducts(IEnumerable<PurchasedProduct> purchasedProducts) {
        await using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
            var sql = @"
                INSERT INTO public.purchased_product
                (""name"", price, quantity, vat, quantity_type, receipt_id)
                VALUES (
                    unnest(@names),
                    unnest(@prices),
                    unnest(@quantitys),
                    unnest(@vats),
                    unnest(@quantity_type),
                    unnest(@receipt_ids)
                )";

            return await connection.ExecuteScalarAsync<int>(sql, new {
                names = purchasedProducts.Select(x => x.Name).ToList(),
                prices = purchasedProducts.Select(x => x.Price).ToList(),
                quantitys = purchasedProducts.Select(x => x.Quantity).ToList(),
                vats = purchasedProducts.Select(x => x.VAT).ToList(),
                quantity_type = purchasedProducts.Select(x => x.QuantityType).ToList(),
                receipt_ids = purchasedProducts.Select(x => x.ReceiptId).ToList()
            });
        }
    }
}