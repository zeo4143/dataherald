import { API_URL } from '@/config'
import useApiFetcher from '@/hooks/api/generics/useApiFetcher'
import { DatabaseConnection, DBConnectionCSV } from '@/models/api'
import { useCallback } from 'react'

const usePostDatabaseConnectionCSV = () => {
  const { apiFetcher } = useApiFetcher()

  const connectDatabase = useCallback(
    async (dbConnection: DBConnectionCSV, file: File | undefined | null) => {
      const formData = new FormData()
      if (file) {
        formData.append('csv_file', file, file.name)
      }

      formData.append('request_json', JSON.stringify(dbConnection))

      return apiFetcher<DatabaseConnection>(
        `${API_URL}/database-connections-csv`,
        {
          method: 'POST',
          body: formData,
        },
      )
    },
    [apiFetcher],
  )

  return connectDatabase
}

export default usePostDatabaseConnectionCSV
