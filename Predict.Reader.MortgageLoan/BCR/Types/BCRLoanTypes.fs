namespace Predict.Reader.MortgageLoan.BCR.Types

open System

module BCRLoanTypes =

    type Instalment =
        { InstalmentId: int option
          PaymentDate: DateTime option
          PrincipalAmount: double option
          InterestAmount: double option
          AdministrationFee: double option
          InsuranceCost: double option
          ManagementFee: double option
          RecalculatedInterest: double option
          TotalInstalment: double option
          RemainingBalance: double option }

    type GraficRambursare =
        { Name: string
          MonthlyInstalments: Instalment list
          Date: DateTime
          IsBasePayment: bool
          IsNormalPayment: bool
          IsExtraPayment: bool }

    let defaultGraficRambursare =
        { Name = null
          MonthlyInstalments = []
          Date = DateTime.UtcNow
          IsBasePayment = false
          IsNormalPayment = false
          IsExtraPayment = false }
