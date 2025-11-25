
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const SolarHealthABI = {
  "abi": [
    {
      "inputs": [],
      "name": "ZamaProtocolUnsupported",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "goalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "euint16",
          "name": "progress",
          "type": "bytes32"
        }
      ],
      "name": "GoalProgressUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "goalId",
          "type": "uint256"
        }
      ],
      "name": "GoalSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "date",
          "type": "uint256"
        }
      ],
      "name": "HealthRecordRecorded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "euint8",
          "name": "score",
          "type": "bytes32"
        }
      ],
      "name": "HealthScoreUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "euint16",
          "name": "handle",
          "type": "bytes32"
        }
      ],
      "name": "allowDecryption",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "euint32",
          "name": "handle",
          "type": "bytes32"
        }
      ],
      "name": "allowStepsDecryption",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "dates",
          "type": "uint256[]"
        },
        {
          "internalType": "uint8",
          "name": "category",
          "type": "uint8"
        }
      ],
      "name": "calculateAverage",
      "outputs": [
        {
          "internalType": "euint16",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "dates",
          "type": "uint256[]"
        }
      ],
      "name": "calculateHealthScore",
      "outputs": [
        {
          "internalType": "euint16",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "dates",
          "type": "uint256[]"
        }
      ],
      "name": "calculateStepsAverage",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "oldDate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "newDate",
          "type": "uint256"
        }
      ],
      "name": "calculateStepsTrend",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "oldDate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "newDate",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "category",
          "type": "uint8"
        }
      ],
      "name": "calculateTrend",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "goalId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "currentDate",
          "type": "uint256"
        }
      ],
      "name": "checkGoalProgress",
      "outputs": [
        {
          "internalType": "euint16",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "confidentialProtocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "goalId",
          "type": "uint256"
        }
      ],
      "name": "deactivateGoal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getActiveGoals",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint8",
              "name": "category",
              "type": "uint8"
            },
            {
              "internalType": "euint16",
              "name": "targetValue",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "deadline",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "active",
              "type": "bool"
            }
          ],
          "internalType": "struct SolarHealth.Goal[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "date",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "category",
          "type": "uint8"
        }
      ],
      "name": "getHealthDataHandle",
      "outputs": [
        {
          "internalType": "euint16",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "date",
          "type": "uint256"
        }
      ],
      "name": "getStepsHandle",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getUserDates",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "goals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "category",
          "type": "uint8"
        },
        {
          "internalType": "euint16",
          "name": "targetValue",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "active",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "healthRecords",
      "outputs": [
        {
          "internalType": "euint16",
          "name": "weight",
          "type": "bytes32"
        },
        {
          "internalType": "euint16",
          "name": "systolicBP",
          "type": "bytes32"
        },
        {
          "internalType": "euint16",
          "name": "diastolicBP",
          "type": "bytes32"
        },
        {
          "internalType": "euint16",
          "name": "bloodSugar",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "steps",
          "type": "bytes32"
        },
        {
          "internalType": "euint16",
          "name": "heartRate",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "healthScores",
      "outputs": [
        {
          "internalType": "euint8",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "date",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "category",
          "type": "uint8"
        },
        {
          "internalType": "externalEuint16",
          "name": "value",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "proof",
          "type": "bytes"
        }
      ],
      "name": "recordHealthData",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "date",
          "type": "uint256"
        },
        {
          "internalType": "externalEuint32",
          "name": "value",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "proof",
          "type": "bytes"
        }
      ],
      "name": "recordSteps",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "dates",
          "type": "uint256[]"
        }
      ],
      "name": "riskAssessment",
      "outputs": [
        {
          "internalType": "euint8",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "category",
          "type": "uint8"
        },
        {
          "internalType": "externalEuint16",
          "name": "targetValue",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "proof",
          "type": "bytes"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "setGoal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userDates",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
} as const;

