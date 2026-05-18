.PHONY: install build test deploy-sepolia deploy-base clean

install:
	forge install smartcontractkit/chainlink --no-commit
	forge install OpenZeppelin/openzeppelin-contracts --no-commit
	forge install foundry-rs/forge-std --no-commit

build:
	forge build

test:
	forge test -vvv

clean:
	forge clean

deploy-sepolia:
	@source .env && forge script script/Deploy.s.sol \
		--rpc-url base_sepolia \
		--broadcast \
		--verify \
		-vvvv

deploy-base:
	@source .env && forge script script/Deploy.s.sol \
		--rpc-url base \
		--broadcast \
		--verify \
		-vvvv
