import axios from 'axios'

// Custom axios base query
export const axiosBaseQuery = ({ baseUrl }: { baseUrl: string }) => async (
  { url, method = 'GET', data, params, headers }: any,
  { getState }: any
) => {
  try {
    const token = (getState?.() as any)?.auth?.token

    const result = await axios({
      url: baseUrl + url,
      method,
      data,
      params,
      timeout: 15000,
      headers: {
        ...headers,
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
    })
    return { data: result.data }
  } catch (axiosError: any) {
    return {
      error: {
        status: axiosError.response?.status,
        data: axiosError.response?.data || axiosError.message,
      },
    }
  }
}