import { AxiosError } from "axios";

export type PromiseResult<T, E> = [T, null] | [null, E];

export function format_axios_error(e: AxiosError): string {
  return JSON.stringify(e.toJSON(), null, 2);
}
