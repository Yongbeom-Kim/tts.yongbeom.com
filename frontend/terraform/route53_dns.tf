variable "dns_domain" {
  type = string
}

variable "website_domain" {
  type = string
}

data "aws_route53_zone" "main" {
  name = var.dns_domain
}

resource "aws_route53_record" "website_record" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.website_domain
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.frontent_dist.domain_name
    zone_id                = aws_cloudfront_distribution.frontent_dist.hosted_zone_id
    evaluate_target_health = true
  }
}