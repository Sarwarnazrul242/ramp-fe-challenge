import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    // If we've reached the end of pagination, don't fetch more
    if (paginatedTransactions?.nextPage === null) {
      return
    }

    try {
      const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
        "paginatedTransactions",
        {
          page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
        }
      )

      if (response === null) {
        return
      }

      setPaginatedTransactions((previousResponse) => {
        if (previousResponse === null) {
          return response
        }

        // Combine existing transactions with new ones
        return {
          data: [...previousResponse.data, ...response.data],
          nextPage: response.nextPage,
        }
      })
    } catch (error) {
      console.error("Failed to fetch paginated transactions:", error)
      // If there's an error, mark the end of pagination
      setPaginatedTransactions((previousResponse) => {
        if (previousResponse === null) {
          return null
        }
        return {
          ...previousResponse,
          nextPage: null,
        }
      })
    }
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
