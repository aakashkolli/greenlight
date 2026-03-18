import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { GRANT_ABI } from './contracts';

export function useGrantContract(grantAddress: `0x${string}`) {
  const {
    writeContract: doWithdraw,
    data: withdrawTx,
    isPending: withdrawPending,
    error: withdrawError,
  } = useWriteContract();

  const {
    writeContract: doRefund,
    data: refundTx,
    isPending: refundPending,
    error: refundError,
  } = useWriteContract();

  const { isSuccess: withdrawDone } = useWaitForTransactionReceipt({ hash: withdrawTx });
  const { isSuccess: refundDone } = useWaitForTransactionReceipt({ hash: refundTx });

  const withdraw = () => doWithdraw({ address: grantAddress, abi: GRANT_ABI, functionName: 'withdraw' });
  const refund = () => doRefund({ address: grantAddress, abi: GRANT_ABI, functionName: 'refund' });

  return { withdraw, refund, withdrawPending, refundPending, withdrawDone, refundDone, withdrawError, refundError };
}
