# Setup

## 1. Install Terraform

Instructions here:

https://learn.hashicorp.com/tutorials/terraform/install-cli

## 2. Install gcloud SDK/CLI

Instructions here:

https://cloud.google.com/sdk/docs/install

## 3. Initialize terraform

    terraform init

**_IMPORTANT NOTE:_** _Terraform (TF) maintains a state file at `terraform.tfstate`. It is very important to avoid corruption in this file since it represents TF's understanding of deployed state. So - when deploying create a branch only for the state file change and take measures to ensure only one person is updating at a time._

# Deploying

## 1. Dry-run terraform to preview the changes TF will make

    terraform plan

## 2. Apply changes

    terraform apply
