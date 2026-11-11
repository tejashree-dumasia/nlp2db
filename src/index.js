import readline from 'readline';
import { dbAgentExecutor } from './agent/index.js';

// Initialize the terminal interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("==================================================");
console.log("🤖 Natural Language Database Agent is online.");
console.log("Type 'exit' or 'quit' to shut down the agent.");
console.log("==================================================\n");

const askQuestion = () => {
  rl.question('\n👤 Ask a data question: ', async (userInput) => {
    // Graceful shutdown
    if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
      console.log('Shutting down agent. Goodbye!');
      rl.close();
      process.exit(0);
    }

    if (!userInput.trim()) {
      return askQuestion();
    }

    try {
      console.log("\n⏳ Agent is thinking (Reading Schema -> Writing SQL -> Executing)...");
      
      // Execute the LangChain ReAct loop
      const response = await dbAgentExecutor.invoke({
        input: userInput
      });

      console.log('\n✅ FINAL ANSWER:');
      console.log(response.output);
      
    } catch (error) {
      console.error('\n❌ Agent encountered an error:', error.message);
    }

    // Loop back for the next question
    askQuestion();
  });
};

// Start the loop
askQuestion();