provider "aws" {
  region = "us-east-1"
}

resource "aws_kms_key" "s3_kms_key" {
  description             = "KMS key for encrypting secure S3 bucket"
  deletion_window_in_days = 10
  enable_key_rotation     = true
}

resource "aws_s3_bucket" "secure_demo_bucket" {
  bucket = "devsecops-demo-secure-bucket-example"
}

resource "aws_s3_bucket_public_access_block" "secure_public_access" {
  bucket = aws_s3_bucket.secure_demo_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "secure_versioning" {
  bucket = aws_s3_bucket.secure_demo_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "secure_encryption" {
  bucket = aws_s3_bucket.secure_demo_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.s3_kms_key.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_security_group" "secure_web_sg" {
  name        = "secure-web-security-group"
  description = "Security group with restricted ingress"

  ingress {
    description = "Allow HTTPS from trusted internal VPC"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    description = "Allow outbound HTTPS traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
