using FluentMigrator;

namespace Predict.Configuration.Migrations;

[Migration(202606060001)]
public class UpdateReceiptsTables_202606060001 : Migration
{
    public override void Up()
    {
        Execute.Sql(@"DROP TABLE IF EXISTS quantity_type;");
        Execute.Sql(@"DROP TABLE IF EXISTS purchased_product;");
        Execute.Sql(@"DROP TABLE IF EXISTS receipt;");

        // =========================
        // RECEIPT
        // =========================
        Execute.Sql(@"
           CREATE TABLE receipt (
                id SERIAL PRIMARY KEY,
                identifier TEXT NOT NULL UNIQUE,
                receipt_date TIMESTAMP NULL,
                total_price numeric NULL,
                total_discount numeric NULL,
                description TEXT NULL,
                provider TEXT NOT NULL,
                currency TEXT NOT NULL,
                data_owner_id INT NOT NULL,
                CONSTRAINT fk_receipt_data_owner FOREIGN KEY (data_owner_id) REFERENCES data_owner(id)
            );
        ");

        // =========================
        // PURCHASED PRODUCT
        // =========================
        Execute.Sql(@"
            CREATE TABLE purchased_product (
                id SERIAL PRIMARY KEY,
                name TEXT NULL,
                price NUMERIC NULL,
                quantity NUMERIC NULL,
                vat INT NULL,
                quantity_type TEXT NOT NULL,
                receipt_id INT NOT NULL,
                CONSTRAINT fk_purchased_product_receipt
                    FOREIGN KEY (receipt_id)
                    REFERENCES receipt(id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE
            );
        ");
    }

    public override void Down()
    {
        Execute.Sql(@"DROP TABLE IF EXISTS purchased_product;");
        Execute.Sql(@"DROP TABLE IF EXISTS receipt;");
    }
}
