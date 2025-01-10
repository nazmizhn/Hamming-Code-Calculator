// Function to generate a table for bit positions with correct positioning of check (C) and data (D) bits
function generateBitPositionTable(totalBits, checkPositions, wordStored, wordFetched) {
  let table = `<h2>Bit Positions and Types</h2><table><tr><th>Bit Position</th>`;
  for (let i = totalBits; i >= 1; i--) table += `<td>${i}</td>`; // Reverse order to match the image
  table += "</tr><tr><th>Type</th>";
  for (let i = totalBits; i >= 1; i--) {
    table += `<td>${checkPositions.includes(i) ? "C" : "D"}</td>`;
  }
  table += "</tr><tr><th>Word Stored</th>";
  for (let i = totalBits - 1; i >= 0; i--) {
    table += `<td>${wordStored[i]}</td>`;
  }
  table += "</tr><tr><th>Word Fetched</th>";
  for (let i = totalBits - 1; i >= 0; i--) {
    table += `<td>${wordFetched[i]}</td>`;
  }
  table += "</tr></table>";
  return table;
}

// Function to calculate check bits using the check-skip pattern
function calculateCheckBitsUsingSteps(word, totalBits, checkPositions) {
  const checkBits = {};
  const calculations = {};  // Store the XOR calculations
  checkPositions.forEach((pos) => {
    let parity = 0;
    let relevantBits = [];
    for (let i = pos; i <= totalBits; i += 2 * pos) {
      for (let j = 0; j < pos && i + j <= totalBits; j++) {
        if (!checkPositions.includes(i + j)) {
          parity ^= parseInt(word[i + j - 1], 10); // XOR for data bits in the check range
          relevantBits.push(`D${i + j}`);
        }
      }
    }
    checkBits[pos] = parity;
    calculations[pos] = relevantBits.join(" ⊕ ");  // Store the XOR calculation string
  });
  return { checkBits, calculations };
}

// Function to calculate and display K (number of check bits)
function calculateK(M) {
  let K = 0;
  let explanation = `<h2>Step 1: Calculate K (Number of Check Bits)</h2>`;
  explanation += `<p>M (data bits) = ${M}</p>`;
  explanation += `<p>We use the formula: <code>2^K - 1 ≥ M + K</code>.</p>`;
  explanation += `<table><tr><th>K</th><th>Formula</th><th>Result</th><th>Condition</th></tr>`;

  // Step-by-step calculation of K
  while (Math.pow(2, K) - 1 < M + K) {
    const result = Math.pow(2, K) - 1;
    explanation += `<tr><td>${K}</td><td>2^${K} - 1 = ${result}</td><td>${result} < ${M + K}</td><td>Not Satisfied</td></tr>`;
    K++;
  }

  // Final value of K
  const result = Math.pow(2, K) - 1;
  explanation += `<tr><td>${K}</td><td>2^${K} - 1 = ${result}</td><td>${result} ≥ ${M + K}</td><td>Satisfied</td></tr>`;
  explanation += `</table>`;
  explanation += `<p>Thus, K = ${K} (number of check bits).</p>`;

  return { K, explanation };
}

// Main Event Listener
document.getElementById("calculateBtn").addEventListener("click", () => {
  const storedWord = document.getElementById("storedWord").value.trim();
  const fetchedWord = document.getElementById("fetchedWord").value.trim();
  const outputDiv = document.getElementById("output");

  if (
    !/^[01]+$/.test(storedWord) ||
    !/^[01]+$/.test(fetchedWord) ||
    storedWord.length !== fetchedWord.length
  ) {
    outputDiv.innerHTML = `<p>Please enter valid binary words of the same length.</p>`;
    return;
  }

  const M = storedWord.length; // Number of data bits
  const { K, explanation } = calculateK(M); // Calculate K and get explanation
  const totalBits = M + K; // Total bits in the word
  const checkPositions = Array.from({ length: K }, (_, i) => Math.pow(2, i)); // Check bit positions (1, 2, 4, 8...)
  const wordStored = Array(totalBits).fill("0");
  const wordFetched = Array(totalBits).fill("0");

  // Fill in data bits into the words, ensuring check bits are skipped
  let dataBitIndex = 0;
  for (let i = totalBits - 1; i >= 0; i--) {
    if (!checkPositions.includes(i + 1)) {
      wordStored[i] = storedWord[dataBitIndex];
      wordFetched[i] = fetchedWord[dataBitIndex];
      dataBitIndex++;
    }
  }

  // Step 1: Display K Calculation
  outputDiv.innerHTML = explanation;

  // Step 2: Bit Positions and Types
  outputDiv.innerHTML += generateBitPositionTable(totalBits, checkPositions, wordStored, wordFetched);

  // Step 3: Calculate Check Bits for Word Stored
  const { checkBits: storedCheckBits, calculations: storedCalculations } = calculateCheckBitsUsingSteps(wordStored, totalBits, checkPositions);
  outputDiv.innerHTML += generateCheckBitTable(storedCheckBits, storedCalculations, "Check Bits for Word Stored");

  // Step 4: Calculate Check Bits for Word Fetched
  const { checkBits: fetchedCheckBits, calculations: fetchedCalculations } = calculateCheckBitsUsingSteps(wordFetched, totalBits, checkPositions);
  outputDiv.innerHTML += generateCheckBitTable(fetchedCheckBits, fetchedCalculations, "Check Bits for Word Fetched");

  // Step 5: Error Detection
  let errorPosition = 0;
  checkPositions.forEach((pos) => {
    if (storedCheckBits[pos] !== fetchedCheckBits[pos]) errorPosition += pos;
  });

  outputDiv.innerHTML += `<h2>Error Detection</h2>`;
  if (errorPosition === 0) {
    outputDiv.innerHTML += `<p>No errors detected.</p>`;
  } else {
    outputDiv.innerHTML += `<p>Error detected at bit position: ${errorPosition}</p>`;
  }
});

// Function to generate a table for check bit calculations
function generateCheckBitTable(checkBits, calculations, label) {
  let table = `<h2>${label}</h2><table><tr><th>Check Bit</th><th>Calculation</th><th>Value</th></tr>`;
  Object.keys(checkBits).forEach((pos) => {
    table += `<tr><td>C${pos}</td><td>${calculations[pos]}</td><td>${checkBits[pos]}</td></tr>`;
  });
  table += "</table>";
  return table;
}
