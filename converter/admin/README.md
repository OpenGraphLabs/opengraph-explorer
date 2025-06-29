# OpenGraph ML on-chain twin admin

## Get Started

### Set up environment variables

```env
SUI_PRIVATE_KEY={your_priv_key}
```

This private key would be used to interact with Sui blockchain for model deployment and inference.

### Install dependencies

```bash
pip install -r ../requirements.txt
```

### Run the admin server

```bash
python run_admin.py
```

The admin interface will be available at `http://localhost:8001`
