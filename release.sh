set -e

# See `README` for how to use this

YELLOW='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
function echo_error {
    echo "${RED}RELEASE: $1$NC"
}

function echo_info {
    echo "${YELLOW}RELEASE: $1$NC"
}

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
VERSION_NUMBER=$1

if [ -z $1 ]; then
    echo_error "You need to provide a version to release"
    exit 1
fi

if [[ "$CURRENT_BRANCH"  != "master" ]]; then
    echo_error "You need to be on the master branch to run this script"
    exit 1
fi

# Check if tag already exists
git pull
if git rev-parse $VERSION_NUMBER >/dev/null 2>&1
then
    echo_error "Version $VERSION_NUMBER already exists"
    exit 1
fi



echo_info "Checking out new release branch"
git checkout -b release/$VERSION_NUMBER

echo_info "Removing .gitignore and building all assets"
rm .gitignore
yarn
yarn build

echo_info "Commiting changes"
git add .
git commit -m "Release commit"

echo_info "Tagging and pushing"
git tag "$VERSION_NUMBER"
git push origin --tags
git push --set-upstream origin release/$VERSION_NUMBER
