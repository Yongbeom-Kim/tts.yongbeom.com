import { describe, test, expect, beforeEach } from 'vitest';
import { set_backend_path } from "../../../../src/utils/backend";
import { get_s3_presigned_upload_link, upload_file_from_s3_presigned_link, get_s3_presigned_download_link } from "../../../../src/utils/backend/endpoints/s3";

const UPLOAD_FILE_NAME = "test.txt";
const UPLOAD_FILE_CONTENT = "test";

// TODO: backend path should be set in a global setup file, with separate values for local and prod backend
beforeEach(() => {
  set_backend_path("http://localhost:8080");
});


describe("test get_s3_presigned_upload_link", () => {
  test("get_s3_presigned_upload_link returns url and fields", async () => {
    const [res, err] = await get_s3_presigned_upload_link(UPLOAD_FILE_NAME);
    expect(err).toBeNull();
    const { url, fields } = res!;
    expect(url).toContain("s3.amazonaws.com");
    expect(fields).toHaveProperty("AWSAccessKeyId");
    expect(fields).toHaveProperty("key");
    expect(fields).toHaveProperty("policy");
    expect(fields).toHaveProperty("signature");
  });
});

describe("test upload_file_from_s3_presigned_link", () => {
  // TODO: Maybe checks for whether file is uploaded properly?
  test("upload_file_from_s3_presigned_link uploads file to s3", async () => {
    const [link_res, link_err] = await get_s3_presigned_upload_link(
      UPLOAD_FILE_NAME
    );
    expect(link_err).toBeNull();
    const { url, fields } = link_res!;
    const file = new File([UPLOAD_FILE_CONTENT], UPLOAD_FILE_NAME);
    const [upload_res, upload_err] = await upload_file_from_s3_presigned_link(
      url,
      fields,
      file
    );
    expect(upload_err).toBeNull();
  }, 15000);
});

describe("test get_s3_presigned_download_link", () => {
  // TODO: Check for download authorization
  test("get_s3_presigned_download_link returns url", async () => {
    const [res, err] = await get_s3_presigned_download_link(UPLOAD_FILE_NAME);
    expect(err).toBeNull();
    expect(res).toContain("s3.amazonaws.com");
  });
});
