. $THIS_DIR/node-default.properties

if [ -f "$THIS_DIR/node-fix.properties" ]
then
	. $THIS_DIR/node-fix.properties
fi

export PATH="$THIS_DIR/../node/$NODE_HACK/node:$THIS_DIR/../node/$NODE_HACK/node/yarn/dist/bin:$PATH"

echo Caminho node:
echo $THIS_DIR/../node/$NODE_HACK/node

echo Versão node:
node --version

echo Versão yarn:
yarn --version
