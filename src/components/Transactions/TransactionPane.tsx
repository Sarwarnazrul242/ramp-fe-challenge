import { useState, useEffect } from "react"
import { InputCheckbox } from "../InputCheckbox"
import { TransactionPaneComponent } from "./types"

export const TransactionPane: TransactionPaneComponent = ({
  transaction,
  loading,
  setTransactionApproval: consumerSetTransactionApproval,
}) => {
  const [approved, setApproved] = useState(transaction.approved)
  const [isUpdating, setIsUpdating] = useState(false)

  // Sync local state with prop when transaction changes
  useEffect(() => {
    setApproved(transaction.approved)
  }, [transaction.approved])

  const handleApprovalChange = async (newValue: boolean) => {
    if (isUpdating) return // Prevent multiple clicks while updating
    
    try {
      setIsUpdating(true)
      await consumerSetTransactionApproval({
        transactionId: transaction.id,
        newValue,
      })
      setApproved(newValue)
    } catch (error) {
      // Revert the checkbox state if the update fails
      setApproved(!newValue)
      console.error("Failed to update transaction approval:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="RampPane">
      <div className="RampPane--content">
        <p className="RampText">{transaction.merchant} </p>
        <b>{moneyFormatter.format(transaction.amount)}</b>
        <p className="RampText--hushed RampText--s">
          {transaction.employee.firstName} {transaction.employee.lastName} - {transaction.date}
        </p>
      </div>
      <div className="RampPane--checkbox">
        <InputCheckbox
          id={transaction.id}
          checked={approved}
          disabled={loading || isUpdating}
          onChange={handleApprovalChange}
        />
        {isUpdating && (
          <span className="RampText--hushed RampText--s" style={{ marginLeft: '8px' }}>
            Updating...
          </span>
        )}
      </div>
    </div>
  )
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})
