# Bulk Upload Guide

This guide explains how to use the bulk upload feature to import multiple food items at once using CSV or Excel files.

## Endpoint

```
POST /api/v1/foods/bulk-upload
```

## Authentication

- **Required**: Admin role with JWT Bearer token
- **Header**: `Authorization: Bearer <your-jwt-token>`

## Request Format

- **Content-Type**: `multipart/form-data`
- **Field Name**: `file`
- **Supported Formats**: CSV (`.csv`), Excel (`.xlsx`, `.xls`)

## CSV/Excel File Format

### Required Columns

| Column Name   | Type   | Required | Description                          | Example            |
|---------------|--------|----------|--------------------------------------|--------------------|
| code          | string | Yes      | Unique food code                     | KE001              |
| name          | string | Yes      | Food name                            | Ugali (Maize meal) |
| categoryName  | string | Yes      | Category name (must exist in system) | Cereals & Grains   |

### Optional Columns

| Column Name     | Type   | Required | Description                          | Example                                      |
|-----------------|--------|----------|--------------------------------------|----------------------------------------------|
| description     | string | No       | Food description                     | Traditional Kenyan staple made from maize    |
| imageId         | string | No       | File ID from files endpoint          | 550e8400-e29b-41d4-a716-446655440000         |
| servingSize     | string | No       | Serving size amount                  | 100                                          |
| servingUnit     | string | No       | Serving size unit                    | grams                                        |
| energyKcal      | number | No       | Energy in kcal per 100g              | 365                                          |
| proteinG        | number | No       | Protein in grams per 100g            | 8.5                                          |
| fatG            | number | No       | Fat in grams per 100g                | 3.2                                          |
| carbohydratesG  | number | No       | Carbohydrates in grams per 100g      | 77.8                                         |
| fiberG          | number | No       | Fiber in grams per 100g              | 2.1                                          |
| sugarG          | number | No       | Sugar in grams per 100g              | 0.5                                          |
| calciumMg       | number | No       | Calcium in mg per 100g               | 28                                           |
| ironMg          | number | No       | Iron in mg per 100g                  | 2.8                                          |
| vitaminAMcg     | number | No       | Vitamin A in mcg per 100g            | 0                                            |
| vitaminCMg      | number | No       | Vitamin C in mg per 100g             | 0                                            |
| sodiumMg        | number | No       | Sodium in mg per 100g                | 5                                            |

## Sample CSV Template

### Basic Template (Without Nutrients)
```csv
code,name,categoryName,description,imageId,servingSize,servingUnit
KE001,Ugali (Maize meal),Cereals & Grains,Traditional Kenyan staple made from maize flour,,100,grams
KE002,Sukuma Wiki,Vegetables,Collard greens commonly eaten in Kenya,,200,grams
```

### Complete Template (With Nutrients)
```csv
code,name,categoryName,description,imageId,servingSize,servingUnit,energyKcal,proteinG,fatG,carbohydratesG,fiberG,sugarG,calciumMg,ironMg,vitaminAMcg,vitaminCMg,sodiumMg
KE001,Ugali (Maize meal),Cereals & Grains,Traditional Kenyan staple made from maize flour,,100,grams,365,8.5,3.2,77.8,2.1,0.5,28,2.8,0,0,5
KE002,Sukuma Wiki,Vegetables,Collard greens commonly eaten in Kenya,,200,grams,32,3.0,0.6,5.4,3.6,0.5,232,0.9,333,62,28
```

**Note**: You can include as many or as few nutrient columns as you have data for. Nutrients are optional and will only be created if at least one nutrient value is provided.

## Response Format

```json
{
  "success": 10,
  "failed": 2,
  "errors": [
    {
      "row": 3,
      "error": "Invalid category: Unknown Category"
    },
    {
      "row": 5,
      "error": "Food code KE001 already exists"
    }
  ]
}
```

### Response Fields

- **success**: Number of successfully imported food items
- **failed**: Number of failed imports
- **errors**: Array of error objects with row number and error message

## Common Errors

### Missing Required Fields
```json
{
  "row": 3,
  "error": "Missing required fields (code, name, or categoryName)"
}
```

### Invalid Category
```json
{
  "row": 5,
  "error": "Invalid category: Fruits"
}
```
**Solution**: Ensure the category exists in the system. Use the exact category name from GET `/api/v1/categories`.

### Duplicate Food Code
```json
{
  "row": 7,
  "error": "Food code KE001 already exists"
}
```
**Solution**: Each food code must be unique. Check existing foods or use a different code.

### Unsupported File Format
```json
{
  "error": "Unsupported file format. Please upload CSV or Excel file."
}
```
**Solution**: Only `.csv`, `.xlsx`, and `.xls` files are supported.

## Usage Example with cURL

```bash
curl -X POST "http://localhost:3000/api/v1/foods/bulk-upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@foods.csv"
```

## Usage Example with JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/v1/foods/bulk-upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  },
  body: formData
});

const result = await response.json();
console.log(`Success: ${result.success}, Failed: ${result.failed}`);
if (result.errors.length > 0) {
  console.log('Errors:', result.errors);
}
```

## Best Practices

1. **Validate Categories First**: Before uploading, ensure all categories exist in the system using GET `/api/v1/categories`.

2. **Use Unique Codes**: Each food item must have a unique code. Consider using a prefix system (e.g., `KE` for Kenya).

3. **Test with Small Batches**: Start with a small CSV file (5-10 rows) to verify the format before uploading large datasets.

4. **Handle Errors**: Review the `errors` array in the response to fix any failed imports, then re-upload only the failed rows.

5. **Backup Data**: Keep a backup of your CSV file before uploading in case you need to make corrections.

6. **Character Encoding**: Use UTF-8 encoding for CSV files to support special characters and international text.

7. **Nutrient Data**: Include nutrient columns only if you have the data. The system will automatically create nutrient records when at least one nutrient value is provided. You can mix rows with and without nutrient data in the same file.

8. **Numeric Values**: Ensure nutrient values are numeric (not text). Empty cells are acceptable for optional nutrient fields.

## Troubleshooting

### All Rows Failed
- Check that your CSV has the correct column headers (case-sensitive)
- Verify that the file is not corrupted
- Ensure categories exist in the system

### Partial Success
- Review the `errors` array to identify specific issues
- Fix the problematic rows and re-upload only those rows

### File Upload Failed
- Check file size limits (default is usually 5MB)
- Verify file format is CSV or Excel
- Ensure you have admin permissions

## Notes

- Row numbers in error messages start from 2 (row 1 is the header)
- The upload process validates each row independently
- Successful rows are committed even if some rows fail
- Category names are case-insensitive during matching
- Nutrients are automatically created when food is uploaded with nutrient data
- If a food is created successfully but nutrient creation fails, the food will still exist (partial success)
- All nutrient values are per 100g of the food item
