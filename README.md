# Go forth and bond

Generative, Dynamic, Collectively-Experienced Artworks on Ethereum.


Development:
    
    $ npx hardhat tests --network hardhat

    # Deploy the contract
    $ npx hardhat deploy --network localhost
    # Set the ERC721 metadata base uri
    $ npx hardhat set-uri --network rinkeby --contract 0x34E30308D8f7C0cfe5d645b38a800Eb36fce1DE0 --uri https://..

    # Test minting and burning 
    $ npx hardhat mint --contract 0x5FbDB2315678afecb367f032d93F642f64180aa3 --network localhost
    $ npx hardhat burn --token 2 --contract 0x5FbDB2315678afecb367f032d93F642f64180aa3 --network localhost
    
    # Generate .mp4 and .png renders for each piece
    $ npx hardhat run scripts/regen.ts --network localhost
