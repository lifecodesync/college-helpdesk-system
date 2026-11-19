import os
import zipfile

def create_sharing_zip():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    zip_filename = os.path.join(base_dir, "college-helpdesk-system.zip")
    
    # Exclude bulky dependencies and cache files
    exclude_dirs = {"node_modules", ".git", "__pycache__", "dist", ".vite", ".pytest_cache"}
    exclude_extensions = {".zip", ".pyc", ".pyo"}

    print("Packaging project for sharing via WhatsApp...")
    with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in exclude_extensions or file == "college-helpdesk-system.zip":
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, base_dir)
                zipf.write(file_path, arcname)

    size_mb = os.path.getsize(zip_filename) / (1024 * 1024)
    print(f"✅ Success! Created {zip_filename}")
    print(f"📦 File Size: {size_mb:.2f} MB (Optimized for WhatsApp Document attachment)")

if __name__ == "__main__":
    create_sharing_zip()
