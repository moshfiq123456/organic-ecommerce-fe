import axios from 'axios'
import * as qs from 'qs-esm'

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
      // Serialize nested params the way Payload expects, e.g.
      // { where: { status: { equals: 'active' } } } → where[status][equals]=active.
      // Axios's default serializer does not, which silently breaks filtered GETs
      // and bulk updates (e.g. clearing the cart left every item 'active').
      paramsSerializer: { serialize: (p: Record<string, any>) => qs.stringify(p) },
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