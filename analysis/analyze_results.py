import pandas as pd
import numpy as np

# Load the CSV file
df = pd.read_csv('results.csv')

# Display basic info
print("="*80)
print("DATASET OVERVIEW")
print("="*80)
print(f"Total records: {len(df)}")
print(f"\nColumns: {df.columns.tolist()}")
print(f"\nFirst few rows:")
print(df.head())

# ============================================================================
# STEP 1: SUMMARY STATISTICS
# ============================================================================
print("\n" + "="*80)
print("STEP 1: OVERALL SUMMARY STATISTICS")
print("="*80)

# Count by Vulnerable status
vulnerable_counts = df['Vulnerable'].value_counts()
total = len(df)

print("\nVulnerability Status Distribution:")
for status in ['Vulnerable', 'Secure', 'Partial']:
    count = vulnerable_counts.get(status, 0)
    pct = (count / total) * 100
    print(f"{status}: {count}/{total} ({pct:.1f}%)")

# Severity breakdown (only for vulnerable cases)
print("\n" + "-"*80)
print("Severity Distribution (Vulnerable cases only):")
print("-"*80)
vulnerable_df = df[df['Vulnerable'] == 'Vulnerable']
severity_counts = vulnerable_df['Severity'].value_counts()

for severity in ['High', 'Medium', 'Low']:
    count = severity_counts.get(severity, 0)
    print(f"{severity}: {count}")

# ============================================================================
# STEP 2: MODEL COMPARISON
# ============================================================================
print("\n" + "="*80)
print("STEP 2: MODEL COMPARISON")
print("="*80)

models = df['Model'].unique()
print(f"\nModels found: {sorted(models)}\n")

model_stats = []
for model in sorted(models):
    model_df = df[df['Model'] == model]
    total_tests = len(model_df)
    
    vuln_count = len(model_df[model_df['Vulnerable'] == 'Vulnerable'])
    secure_count = len(model_df[model_df['Vulnerable'] == 'Secure'])
    partial_count = len(model_df[model_df['Vulnerable'] == 'Partial'])
    
    vuln_rate = (vuln_count / total_tests) * 100 if total_tests > 0 else 0
    
    print(f"{model}: {vuln_count}/{total_tests} vulnerable ({vuln_rate:.1f}%)")
    
    model_stats.append({
        'Model': model,
        'Total Tests': total_tests,
        'Vulnerable': vuln_count,
        'Secure': secure_count,
        'Partial': partial_count,
        'Vulnerability Rate': f"{vuln_rate:.1f}%"
    })

# ============================================================================
# STEP 3: CATEGORY BREAKDOWN
# ============================================================================
print("\n" + "="*80)
print("STEP 3: CATEGORY BREAKDOWN")
print("="*80)

categories = df['Category'].unique()
print(f"\nCategories found: {sorted(categories)}\n")

category_stats = []
for category in sorted(categories):
    cat_df = df[df['Category'] == category]
    total_tests = len(cat_df)
    
    vuln_count = len(cat_df[cat_df['Vulnerable'] == 'Vulnerable'])
    vuln_rate = (vuln_count / total_tests) * 100 if total_tests > 0 else 0
    
    print(f"{category}: {vuln_count}/{total_tests} vulnerable ({vuln_rate:.1f}%)")
    
    category_stats.append({
        'Category': category,
        'Tests': total_tests,
        'Vulnerable': vuln_count,
        'Rate': f"{vuln_rate:.1f}%"
    })

# ============================================================================
# GENERATE TABLES FOR PAPER
# ============================================================================
print("\n" + "="*80)
print("TABLES FOR PAPER - RESULTS SECTION")
print("="*80)

# Table 1: Overall Results by Model
print("\n" + "-"*80)
print("TABLE 1: Overall Results by Model")
print("-"*80)
table1 = pd.DataFrame(model_stats)
print(table1.to_string(index=False))

# Table 2: Results by Category
print("\n" + "-"*80)
print("TABLE 2: Results by Category")
print("-"*80)
table2 = pd.DataFrame(category_stats)
print(table2.to_string(index=False))

# Table 3: Severity Distribution
print("\n" + "-"*80)
print("TABLE 3: Severity Distribution (Vulnerable cases)")
print("-"*80)
severity_stats = []
total_vulnerable = len(vulnerable_df)
for severity in ['High', 'Medium', 'Low']:
    count = severity_counts.get(severity, 0)
    pct = (count / total_vulnerable) * 100 if total_vulnerable > 0 else 0
    severity_stats.append({
        'Severity': severity,
        'Count': count,
        'Percentage': f"{pct:.1f}%"
    })

table3 = pd.DataFrame(severity_stats)
print(table3.to_string(index=False))

# ============================================================================
# ADDITIONAL ANALYSIS
# ============================================================================
print("\n" + "="*80)
print("ADDITIONAL INSIGHTS")
print("="*80)

# Vulnerability types breakdown
print("\nVulnerability Types (top 10):")
vuln_types = vulnerable_df['Vulnerability_Type'].value_counts().head(10)
for vtype, count in vuln_types.items():
    print(f"  {vtype}: {count}")

# Cross-tabulation: Model vs Category
print("\n" + "-"*80)
print("Model Performance by Category (Vulnerable count):")
print("-"*80)
crosstab = pd.crosstab(
    df[df['Vulnerable'] == 'Vulnerable']['Model'],
    df[df['Vulnerable'] == 'Vulnerable']['Category']
)
print(crosstab)

print("\n" + "="*80)
print("ANALYSIS COMPLETE!")
print("="*80)
print("\nNext steps:")
print("1. Copy these tables into your Results section")
print("2. Create visualizations if needed")
print("3. Write interpretations for each finding")