#!/bin/bash

echo "🔐 ASSIGN USER ROLES SCRIPT"

BASE_URL="https://acme.localhost:5000"

# === ADMIN CREDENTIALS ===
ADMIN_EMAIL="admin@acme.com"
ADMIN_PASSWORD="Enter adnom123!" # Change this to the actual admin password

# === USER ROLE ASSIGNMENTS ===
# Format: "email:role"
# Available roles: TenantAdmin, Manager, User, ReadOnly
ASSIGNMENTS=(
  "schen@acme.com:Manager"
  "mrodriguez@acme.com:User"
  "akim@acme.com:User"
  "jwilliams@acme.com:Manager"
  "dpark@acme.com:TenantAdmin"
)

# ─── Step 1: Login ────────────────────────────────────────────────────────────
echo ""
echo "Logging in as $ADMIN_EMAIL..."

LOGIN_RESPONSE=$(curl -k -s -X POST "$BASE_URL/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed:"
  echo "$LOGIN_RESPONSE" | jq '.'
  exit 1
fi

echo "✅ Login successful"

# ─── Step 2: Fetch all users ──────────────────────────────────────────────────
echo ""
echo "Fetching user list..."

USERS_RESPONSE=$(curl -k -s -w "\n__STATUS__%{http_code}" -X GET "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $TOKEN")

USERS_STATUS=$(echo "$USERS_RESPONSE" | grep "__STATUS__" | sed 's/__STATUS__//')
USERS=$(echo "$USERS_RESPONSE" | sed '/__STATUS__/d')

if [ "$USERS_STATUS" != "200" ]; then
  echo "❌ Failed to fetch users (HTTP $USERS_STATUS):"
  echo "$USERS" | jq '.' 2>/dev/null || echo "$USERS"
  exit 1
fi

USER_COUNT=$(echo "$USERS" | jq -r 'if type == "array" then length | tostring else "0" end' 2>/dev/null)
USER_COUNT="${USER_COUNT:-0}"

if [ "$USER_COUNT" -eq 0 ]; then
  echo "❌ No users found in tenant"
  exit 1
fi

echo "✅ Found $USER_COUNT user(s)"

# ─── Step 3: Assign roles ─────────────────────────────────────────────────────
echo ""
echo "Assigning roles..."

for ASSIGNMENT in "${ASSIGNMENTS[@]}"; do
  EMAIL="${ASSIGNMENT%%:*}"
  ROLE="${ASSIGNMENT##*:}"

  # Handle both camelCase (.email/.id) and PascalCase (.Email/.Id) responses
  USER_ID=$(echo "$USERS" | jq -r --arg email "$EMAIL" \
    '.[] | select((.email // .Email) == $email) | (.id // .Id)')

  if [ -z "$USER_ID" ] || [ "$USER_ID" == "null" ]; then
    echo "  ⚠️  User not found: $EMAIL — skipping"
    continue
  fi

  echo -n "  $EMAIL → $ROLE ... "

  RESULT=$(curl -k -s -X POST "$BASE_URL/api/admin/users/$USER_ID/roles" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"roleName\":\"$ROLE\"}")

  MESSAGE=$(echo "$RESULT" | jq -r '.message // empty')

  if [ -n "$MESSAGE" ]; then
    echo "✅ $MESSAGE"
  else
    echo "❌ Failed"
    echo "$RESULT" | jq '.'
  fi
done

echo ""
echo "Done."