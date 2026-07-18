using static Predict.Reader.MortgageLoan.BCR.Types.BCRLoanTypes;

namespace Predict.Service;

public interface ILoanService
{
    List<GraficRambursare> GetBcrMortgageLoans();

}
