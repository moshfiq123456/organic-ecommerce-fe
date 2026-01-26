import axios from 'axios'

// Custom axios base query
export const axiosBaseQuery = ({ baseUrl }: { baseUrl: string }) => async ({ url, method = 'GET', data, params }: any) => {
  try {
    const result = await axios({
      url: baseUrl + url,
      method,
      data,
      params,
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