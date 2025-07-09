import { Plan } from "..";

Plan({
  user_input: `Act as a senior cryptocurrency analyst. Conduct a fundamental and market analysis for Polkadot(DOT) , a newly listed digital asset. **Output must be a cohesive written report** using formal business language. Structure content strictly according to these sections:  

### **Step 1: Project Fundamental Analysis**  
**Data Requirements**:  
- Extract from whitepapers/official communications: Strategic vision alignment with current market narratives (e.g., DePIN, AI, RWA)  
- Quantify Total Addressable Market (TAM): Cite industry reports (Messari, CoinGecko) with CAGR projections  
- Competitive analysis: List top 3 direct competitors with comparative USPs  
- Team audit: Validate core members' LinkedIn profiles and prior project track records  
- Funding verification: Confirm investor names, round sizes, and vesting schedules via Crunchbase/CryptoRank  
- Social momentum: Report Twitter/Telegram follower growth rate and GitHub commit frequency  

**Output Structure**:  
\`\`\`  
**Strategic Direction & Theme Relevance**  
[Concise paragraph evaluating narrative positioning with market data citations]  

**Market Size & Growth Potential**  
[Quantitative TAM/SAM analysis with source-linked projections]  

**Competitive Landscape**  
[Comparison of key differentiators vs. (Competitor A, B, C)]  

**Team Assessment**  
[Summary of core members' credentials and execution capability evidence]  

**Backer Credibility**  
[List of confirmed investors with funded amounts and strategic value add]  

**Community Traction**  
[Metrics-driven evaluation of social engagement and holder growth]  

**Fundamental Conclusion**:  
[1-2 sentence thesis on project viability]  
\`\`\`  

### **Step 2: Time-Bound Catalysts & Risks**  
**Methodology**:  
- Short-term (<1 month): Scan event calendars for exchange listings/partnerships  
- Medium-term (3 months): Audit tokenomics documents for unlock events  
- Long-term (6+ months): Evaluate roadmap deliverables against team capability  
- Price reflection test: Cross-verify social hype vs. on-chain liquidity depth  

**Output Structure**:  
\`\`\`  
**Near-Term Catalysts (<1 Month)**  
- Growth drivers: [List specific events with dates and expected impact]  
- Key risks: [Sector volatility exposure with volatility index data]  
- Market pricing status: [Analysis of futures funding rates/OI changes]  

**Mid-Term Trajectory (3 Months)**  
- Growth drivers: [Product milestones with development progress evidence]  
- Key risks: [Token supply inflation analysis using TokenUnlocks data]  
- Market pricing status: [Volume vs. unlock size comparative assessment]  

**Long-Term Outlook (6+ Months)**  
- Growth drivers: [Protocol scalability solutions and adoption pathways]  
- Key risks: [Regulatory hurdles and product-market fit challenges]  
- Market pricing status: [FDV/user ratio vs. sector benchmarks]  
\`\`\`

### **Step 3: Scenario-Based Valuation**  
**Data Requirements**:  
- Current FDV comparison: Sector leaders (top 3 MCap) vs. new entrants  
- Historical analogs: Similar tokens at equivalent lifecycle stage  
- Liquidity sensitivity: Model impact of ±30% market volume  

**Output Structure**:  
\`\`\`  
**Valuation Framework**  
- Current Fully Diluted Valuation: [Data source]  
- Sector benchmark range: [Sector] projects trade at FDV [X]-[Y]  

**Scenario Analysis**:  
1. **Base Case (Execution Success + Neutral Market)**  
   - Outcome: [X]x current valuation → ~$[ ]M FDV  
   - Rationale: [Sector median comps + delivery probability]  

2. **Bull Case (Execution Success + Favorable Market)**  
   - Outcome: [X]x current valuation → ~$[ ]M FDV  
   - Rationale: [Sector leader comps at cycle peaks]  

3. **Downside Case (Execution Failure + Neutral Market)**  
   - Outcome: [X]x current valuation → ~$[ ]M FDV  
   - Rationale: [Historical failure analogs + inflation impact]  

4. **Stress Case (Execution Failure + Bear Market)**  
   - Outcome: [X]x current valuation → ~$[ ]M FDV  
   - Rationale: [Liquidity crisis precedents]  

**Alternative Opportunities**:  
- Higher reward/same risk: [Sector]'s [Project A] offers [catalyst] within [timeline]  
- Lower risk/similar reward: [Other sector]'s [Project B] has [stability advantage]  
\`\`\`  

### **Step 5: Position Management Strategy**  
**Data Inputs**:  
- Technical levels: 30-day support/resistance (CoinGlass liquidation clusters)  
- On-chain signals: Exchange net flows + whale accumulation patterns  

**Output Structure**:  
\`\`\`  
**Strategic Positioning**  
**New Entrants**:  
- Entry protocol: [DCA/limit order strategy] below $[ ] (aligned with [indicator])  
- Key support: $[ ] (validated by [data source])  

**Profitable Holders**:  
- Profit-taking: Scale out [X]% at $[ ] resistance (tested [ ] times)  
- Dynamic exit: Trail stop-loss upon [technical condition]  

**Underwater Positions**:  
- Salvage protocol: Stop-loss at $[ ] ([ ]% below liquidation density zone)  
- Re-entry conditions: Requires [fundamental catalyst confirmation]  
\`\`\`  

### **Conclusion: Strategic Assessment**  
\`\`\`  
**Three-Pillar Evaluation**  
1. **Current Fundamental Strength**  
   [Summary of core advantages/weaknesses without scoring]  

2. **Forward-Looking Catalysts**  
   [Critical upcoming binary events with timeline]  

3. **Risk-Reward Asymmetry**  
   [Upside/downside ratio assessment under current market conditions]  

**Call to Action**:  
- Immediate monitoring: Track [specific metric] via [dashboard link]  
- Execution venues: Recommended DEX/CEX pairs: [Platform][Pair]  
- Community engagement: Join [project]'s [date] AMA re: [topic]  
\`\`\`  

### **Critical Format Rules**  
- **NO TABLES**: Use clear section headings and bullet points  
- **Data Anchoring**: Every claim must cite sources (e.g., "Santiment social dominance: 23% - Jul 2024")  
- **Concision**: Maximum 3 sentences per subsection  
- **Omit Ratings**: Keep score/grade references blank as instructed  
- **Flow**: Maintain logical progression between sections  
---  

**Key Advantages of This Format:**  
1. **Professional Narrative Flow**: Replaces tables with structured paragraphs while preserving comparatives  
2. **Action-Oriented Insights**: Catalysts/risks presented as time-bound narratives  
3. **Audit Trail**: Embedded data sources enable fact-checking  
4. **Scenario Visualization**: Valuation outcomes described as vivid what-if cases  
5. **Decision Readiness**: Position strategies translate directly into executable steps
`,
}).then((res) => {
  console.log(res);
});