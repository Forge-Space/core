# Outputs for VPC module

output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "vpc_arn" {
  description = "The ARN of the VPC"
  value       = aws_vpc.main.arn
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "public_subnet_cidrs" {
  description = "List of public subnet CIDR blocks"
  value       = aws_subnet.public[*].cidr_block
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "private_subnet_cidrs" {
  description = "List of private subnet CIDR blocks"
  value       = aws_subnet.private[*].cidr_block
}

output "database_subnet_ids" {
  description = "List of database subnet IDs"
  value       = aws_subnet.database[*].id
}

output "database_subnet_cidrs" {
  description = "List of database subnet CIDR blocks"
  value       = aws_subnet.database[*].cidr_block
}

output "internet_gateway_id" {
  description = "The ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}

output "nat_gateway_id" {
  description = "The ID of the NAT Gateway"
  value       = var.use_localstack ? null : aws_nat_gateway.main[0].id
}

output "nat_gateway_public_ip" {
  description = "The public IP of the NAT Gateway"
  value       = var.use_localstack ? null : aws_eip.nat[0].public_ip
}

output "public_route_table_id" {
  description = "The ID of the public route table"
  value       = aws_route_table.public.id
}

output "private_route_table_id" {
  description = "The ID of the private route table"
  value       = aws_route_table.private.id
}

output "database_route_table_id" {
  description = "The ID of the database route table"
  value       = aws_route_table.database.id
}

output "availability_zones" {
  description = "List of availability zones"
  value       = data.aws_availability_zones.available.names
}

output "availability_zone_ids" {
  description = "List of availability zone IDs"
  value       = data.aws_availability_zones.available.zone_ids
}

output "default_security_group_id" {
  description = "The ID of the default security group"
  value       = aws_vpc.main.default_security_group_id
}

output "main_route_table_id" {
  description = "The ID of the main route table"
  value       = aws_vpc.main.main_route_table_id
}

output "dhcp_options_id" {
  description = "The ID of the DHCP options"
  value       = aws_vpc.main.dhcp_options_id
}