variable "website_bucket_name" {
  type = string

}

resource "aws_s3_bucket" "frontend" {
  bucket = var.website_bucket_name
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = data.aws_iam_policy_document.frontend_public_read.json
}

data "aws_iam_policy_document" "frontend_public_read" {
  statement {
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    actions   = ["s3:GetObject"]
    resources = [aws_s3_bucket.frontend.arn, "${aws_s3_bucket.frontend.arn}/*"]
  }
}

module "dir" {
  source = "hashicorp/dir/template"

  base_dir = "${path.module}/../dist"
}

resource "aws_s3_object" "object" {
  bucket       = var.website_bucket_name
  for_each     = module.dir.files
  key          = each.key
  content_type = each.value.content_type

  # The template_files module guarantees that only one of these two attributes
  # will be set for each file, depending on whether it is an in-memory template
  # rendering result or a static file on disk.
  source  = each.value.source_path
  content = each.value.content

  # Unless the bucket has encryption enabled, the ETag of each object is an
  # MD5 hash of that object.
  etag = each.value.digests.md5

  # We need this depends_on to invalidate the cloudfront cache before uploading all aws s3 objects.
  depends_on = [ null_resource.s3_cache_invalidation ]
}