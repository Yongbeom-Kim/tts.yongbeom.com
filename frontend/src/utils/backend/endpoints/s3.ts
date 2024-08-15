import axios, { AxiosError } from "axios";
import { format_axios_error, PromiseResult } from "../utils/utils";

export type UploadStatus = "GETTING_LINK" | "UPLOADING" | "UPLOADED";

export const get_s3_presigned_upload_link = async function (
  s3_bucket_object_key: string
): Promise<
  PromiseResult<{ url: string; fields: { [key: string]: string } }, string>
> {
  try {
    const res = await axios.post(`/get_presigned_upload_link`, {
      s3_bucket_object_key: s3_bucket_object_key,
      validateStatus: (status: number) => status === 200,
    });
    const { url, fields } = res.data["url_data"];
    return [{ url, fields }, null];
  } catch (e: unknown) {
    if (!(e instanceof AxiosError)) throw e;

    return [null, format_axios_error(e)];
  }
};

export const upload_file_from_s3_presigned_link = async function (
  url: string,
  fields: { [key: string]: string },
  file: File
): Promise<PromiseResult<null, string>> {
  const formData = new FormData();
  Object.entries(fields).forEach((e) => {
    formData.append(e[0], e[1]);
  });
  formData.append("file", file);

  try {
    await axios.post(url, formData, {validateStatus: (status: number) => status === 204});
    return [null, null];
  } catch (e: unknown) {
    if (!(e instanceof AxiosError)) throw e;

    return [null, format_axios_error(e)];
  }
};


export const get_s3_presigned_download_link = async function (
  s3_bucket_object_key: string
): Promise<
  PromiseResult<string, string>
> {
  try {
    const res = await axios.post(`/get_presigned_download_link`, {
      s3_bucket_object_key: s3_bucket_object_key,
      validateStatus: (status: number) => status === 200,
    });
    const url = res.data["url_data"];
    return [url, null];
  } catch (e: unknown) {
    if (!(e instanceof AxiosError)) throw e;

    return [null, format_axios_error(e)];
  }
};