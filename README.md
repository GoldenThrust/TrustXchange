<p align="center">
  <img src="trustxchange.png" alt="TrustXchange logo" />
</p>

# TrustXchange

TrustXchange is an innovative Web5 application that leverages the power of decentralized identity and financial interoperability through the [TBDex SDK](https://tbdex.io/). It facilitates secure transactions between wallet applications and liquidity providers, enabling seamless peer-to-peer exchanges while utilizing the latest Web5 and decentralized protocols. This project is developed as part of the [TBDex Hackathon](https://www.tbdex.io/hackathon), pushing the boundaries of decentralized finance and identity solutions.

## Overview

TrustXchange allows users to securely perform peer-to-peer financial transactions by combining decentralized identity with a flexible, privacy-focused architecture. The platform ensures that users retain control over their data, while providing secure and profitable transaction pathways for all parties involved.

### Key Considerations

- **Profitability**:  
  TrustXchange operates with a streamlined profit model, charging a 3% fee for every successful transaction made by users. This fee ensures sustainability while keeping the platform competitive for both customers and liquidity providers.

- **Optionality**:  
  TrustXchange offers users a choice of payment options, making transactions highly customizable. A simple matching mechanism is implemented to help users choose their preferred payment currency for transfers. Additionally, the platform provides an optional advanced search feature, allowing users to filter transactions based on criteria such as transaction speed or payout unit per pay-in. This feature adds a layer of convenience and flexibility for users seeking specific outcomes.

- **Customer Management**:  
  Decentralized identifiers (DIDs) and verifiable credentials (VCs) are automatically stored in the database once a user creates an account. This ensures that user identity and credentials are available for seamless integration into transactions. On the backend, these details are efficiently presented to the participating financial institutions (PFIs), enabling smooth interactions and validation during transactions.

- **Customer Satisfaction**:  
  To enhance user experience, TrustXchange tracks the performance of PFIs by creating an endpoint that retrieves transaction statistics. This includes the number of transactions completed by users with a specific PFI, as well as the number of canceled transactions. These figures are provided in a percentage format, helping users assess the reliability of various PFIs by comparing successful transactions against cancellations.

## Features

- **Decentralized Identity & Security**:  
  Users are empowered with full control over their identities and data, ensuring privacy and autonomy. All transactions are secured using advanced cryptographic methods, providing trustless interaction between users and PFIs.

- **Efficient Transaction Matching**:  
  Users can match transactions based on preferred currencies or other factors like transaction speed and payout rate, giving them the ability to optimize their transfers.

- **Comprehensive Transaction Analytics**:  
  Users have access to detailed transaction reports, including success rates and cancellation percentages, helping them make informed decisions when choosing liquidity providers.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) >= 16.x
- npm or yarn
- TBDex SDK (included in `package.json`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/GoldenThrust/TrustXchange.git
