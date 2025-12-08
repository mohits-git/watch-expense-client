echo "Building production assets..."
ng build --configuration production

echo "Deleting old files in the s3 bucket..."
aws s3 rm s3://watchexpense.mohits.me --recursive

echo "Uploading new files to the s3 bucket..."
aws s3 cp ./dist/watch-expense-client/browser s3://watchexpense.mohits.me --recursive

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id EJ32DRF1SA3HO --paths "/*"

echo "Deployment completed successfully!"
echo "Run 'aws cloudfront list-invalidations --distribution-id EJ32DRF1SA3HO' to check the status of the invalidation."
