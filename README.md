<p align="center">
  <img src="trustxchange.png" alt="TrustXchange logo" />
</p>

# TrustXchange

TrustXchange is an innovative Web5 application that leverages the power of decentralized identity and financial interoperability through the [TBDex SDK](https://tbdex.io/). It facilitates secure transactions between wallet applications and liquidity providers, enabling seamless peer-to-peer exchanges while utilizing the latest Web5 and decentralized protocols. Developed as part of the [TBDex Hackathon](https://www.tbdex.io/hackathon), TrustXchange pushes the boundaries of decentralized finance and identity solutions. The project emphasizes user ease by providing an intuitive, efficient, and secure financial experience.

### Key Considerations

- **Profitability**:  
  TrustXchange operates with a sustainable profit model, charging a 3% fee for every successful transaction. This fee is designed to maintain platform operations while remaining competitive and fair for both customers and liquidity providers (PFIs). This streamlined model ensures that users are charged only when transactions are successfully completed, promoting trust in the platform.

- **Optionality**:  
  TrustXchange offers users a high degree of flexibility with their financial transactions. A simple matching mechanism helps users choose their preferred offering or payment currency for transactions. Users can filter transactions by criteria such as pay-in and payout currency, or payout units per pay-in. To ensure users have access to the most accurate and up-to-date offerings, transaction options are cached for 24 hours, allowing real-time updates during filtering or matchmaking.

- **Customer Management**:  
  Decentralized identifiers (DIDs) and verifiable credentials (VCs) are securely stored in the database as soon as a user creates an account. This guarantees that user identity and credentials are seamlessly integrated into transactions. On the backend, these credentials are efficiently presented to participating PFIs, enabling smooth verification during transactions. Additionally, user VCs are dynamically compared with PFI offerings in real-time, allowing users to instantly know if an offering requires additional verification before proceeding with a transaction. This ensures transparency and reduces delays during the transaction process.

- **Customer Satisfaction**:  
  TrustXchange prioritizes user experience by tracking the performance of PFIs. An endpoint has been developed to retrieve transaction statistics such as the number of successful and canceled transactions per PFI. These figures are provided as percentages and displayed on the PFI stats page. By comparing successful transactions against cancellations, users can assess the reliability of various PFIs, allowing them to make more informed decisions when selecting a liquidity provider.

## Features

- **Decentralized Identity & Security**:  
  TrustXchange empowers users with full control over their identities and data, ensuring maximum privacy and autonomy. Transactions are secured with advanced cryptographic methods, providing trustless, secure interactions between users and PFIs. This guarantees that users’ sensitive information is protected while maintaining the integrity of financial exchanges.

- **Efficient Transaction Matching**:  
  Users have the ability to match transactions based on their preferred currencies or other criteria, such as transaction speed or payout rate. This optimization enables users to tailor their financial transfers according to their needs, making the process both convenient and efficient.

- **Comprehensive Transaction Analytics**:  
  TrustXchange offers users detailed insights into their transaction history through analytics that include success rates and cancellation percentages. These insights help users evaluate the performance of PFIs and make informed decisions when choosing a liquidity provider. By providing real-time data, TrustXchange ensures users are fully aware of the platform's performance.

## Getting Started

### Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) >= 16.x
- npm or yarn
- TBDex SDK (included in `package.json`)

### Installation

Follow these steps to install and run TrustXchange locally:

1. **Clone the repository**:
  ```bash
  git clone https://github.com/GoldenThrust/TrustXchange.git
  ```
2.Navigate to the project directory:
  ```bash
  cd TrustXchange
  ```
3. Install dependencies:
  - Install root dependencies:
    ```bash
    npm install
    ```
  - Install backend dependencies:
    ```bash
    cd backend/
    npm install
    ```
  - Install frontend dependencies:
    ```bash
    cd ../frontend/
    npm install
    ```
4. Set up environment variables:
- Create a .env file in the root directory by copying the provided .env-example file:
  ``` bash
  cp .env-example .env
  ```
- Edit the .env file to set your configuration variables:

### Running the Application
  To run the application:
  1. Build the frontend:
  ```bash
    cd frontend
    npm run build
  ```
  2. Start the backend server:
  ```bash
    cd ../backend
    npm run start
  ```
3. Open your browser and navigate to http://localhost:3000 to access TrustXchange.


## License
This project is licensed under the MIT License.

## Contact
For any questions, please reach out via [adenijiolajid01@gmail.com](adenijiolajid01@gmail.com).