using static Predict.Reader.MortgageLoan.BCR.Types.BCRMortgageLoanTypes;

namespace Predict.Service;

public interface ILoanService
{
    List<GraficRambursare> GetBcrMortgageLoans();

}
