# Go forth and bond

Generative, Dynamic, Collectively-Experienced Artworks on Ethereum.


Development:

    # Test minting and burning 
    $ npx hardhat mint --contract 0x5FbDB2315678afecb367f032d93F642f64180aa3 --network localhost
    $ npx hardhat burn --token 2 --contract 0x5FbDB2315678afecb367f032d93F642f64180aa3 --network localhost
    
    # Generate .mp4 and .png renders for each piece
    $ npx hardhat run scripts/regen.ts --network localhost
