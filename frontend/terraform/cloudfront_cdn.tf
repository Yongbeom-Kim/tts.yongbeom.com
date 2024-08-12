resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "Managed by Terraform. For the tts.yongbeom.com application."
}

resource "aws_cloudfront_distribution" "frontent_dist" {
  origin {
    s3_origin_config {
        origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
    domain_name = aws_s3_bucket.frontend.bucket_domain_name
    origin_id = aws_s3_bucket_website_configuration.frontend.website_endpoint
  }

  default_cache_behavior {
    compress = true
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    cache_policy_id = aws_cloudfront_cache_policy.caching_optimized.id
    target_origin_id = aws_s3_bucket_website_configuration.frontend.website_endpoint
  }

  price_class = "PriceClass_200"
  aliases = ["${var.website_route}", "www.${var.website_route}"]

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cert.arn
    ssl_support_method = "sni-only"
  }

  http_version = "http2"
  default_root_object = "index.html"

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations = [ ]
    }
  }

  enabled = true


}

resource "aws_cloudfront_cache_policy" "caching_optimized" {
    name = "tts-yongbeom-com-caching-optimized"
    min_ttl = 1
    max_ttl = 31536000
    default_ttl = 86400

    parameters_in_cache_key_and_forwarded_to_origin {
      cookies_config {
        cookie_behavior = "none"
      }
      headers_config {
        header_behavior = "none"
      }
      query_strings_config {
        query_string_behavior = "none"
      }
      enable_accept_encoding_brotli = true
      enable_accept_encoding_gzip = true
    }
}

# Cache invalidation on S3 upload
resource "null_resource" "s3_cache_invalidation" {
  for_each     = module.dir.files

  provisioner "local-exec" {
    command = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.frontent_dist.id} --paths '/${each.key}'"
  }
  triggers = {
    hash = each.value.digests.md5
  }
}


## SSL ACM Certificate

resource "aws_acm_certificate" "cert" {
  domain_name       = var.website_route
  subject_alternative_names = ["www.${var.website_route}"]
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "validate" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.verification_records : record.fqdn]
}

resource "aws_route53_record" "verification_records" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}