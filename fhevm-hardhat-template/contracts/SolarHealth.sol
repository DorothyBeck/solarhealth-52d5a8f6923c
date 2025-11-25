// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint8, euint16, euint32, externalEuint8, externalEuint16, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SolarHealth - Privacy-First Health Data Management Platform
/// @notice A fully encrypted health data management system using FHEVM
contract SolarHealth is ZamaEthereumConfig {
    // 数据结构
    struct HealthRecord {
        euint16 weight;       // kg * 10 (e.g., 705 = 70.5kg)
        euint16 systolicBP;   // 收缩压 (mmHg)
        euint16 diastolicBP;  // 舒张压 (mmHg)
        euint16 bloodSugar;    // 血糖 (mg/dL)
        euint32 steps;        // 步数
        euint16 heartRate;    // 心率 (BPM)
        uint256 timestamp;
    }

    struct Goal {
        uint8 category;       // 0=weight, 1=bloodPressure, 2=steps, 3=heartRate, 4=bloodSugar
        euint16 targetValue;  // 目标值（加密）
        uint256 deadline;
        bool active;
    }

    // 状态变量
    mapping(address => mapping(uint256 => HealthRecord)) public healthRecords; // user => date => record
    mapping(address => Goal[]) public goals; // user => goals
    mapping(address => euint8) public healthScores; // user => score (0-100)
    mapping(address => uint256[]) public userDates; // user => dates array (for iteration)
    
    // 事件
    event HealthRecordRecorded(address indexed user, uint256 date);
    event GoalSet(address indexed user, uint256 goalId);
    event HealthScoreUpdated(address indexed user, euint8 score);
    event GoalProgressUpdated(address indexed user, uint256 goalId, euint16 progress);

    /// @notice 记录健康数据
    /// @param date 日期（Unix timestamp，仅日期部分）
    /// @param category 数据类别：0=weight, 1=bloodPressure(systolic), 2=bloodPressure(diastolic), 3=bloodSugar, 4=steps, 5=heartRate
    /// @param value 加密的数值
    /// @param proof 输入证明
    function recordHealthData(
        uint256 date,
        uint8 category,
        externalEuint16 value,
        bytes calldata proof
    ) external {
        euint16 encryptedValue = FHE.fromExternal(value, proof);
        
        HealthRecord storage record = healthRecords[msg.sender][date];
        
        if (category == 0) {
            record.weight = encryptedValue;
        } else if (category == 1) {
            record.systolicBP = encryptedValue;
        } else if (category == 2) {
            record.diastolicBP = encryptedValue;
        } else if (category == 3) {
            record.bloodSugar = encryptedValue;
        } else if (category == 4) {
            // Steps use euint32, need to convert
            record.steps = FHE.asEuint32(encryptedValue);
        } else if (category == 5) {
            record.heartRate = encryptedValue;
        } else {
            revert("Invalid category");
        }
        
        record.timestamp = block.timestamp;
        
        // 添加到用户日期数组（如果不存在）
        uint256[] storage dates = userDates[msg.sender];
        bool exists = false;
        for (uint i = 0; i < dates.length; i++) {
            if (dates[i] == date) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            dates.push(date);
        }
        
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, msg.sender);
        
        emit HealthRecordRecorded(msg.sender, date);
    }

    /// @notice 记录步数（使用 euint32）
    /// @param date 日期
    /// @param value 加密的步数值
    /// @param proof 输入证明
    function recordSteps(
        uint256 date,
        externalEuint32 value,
        bytes calldata proof
    ) external {
        euint32 encryptedValue = FHE.fromExternal(value, proof);
        
        HealthRecord storage record = healthRecords[msg.sender][date];
        record.steps = encryptedValue;
        record.timestamp = block.timestamp;
        
        uint256[] storage dates = userDates[msg.sender];
        bool exists = false;
        for (uint i = 0; i < dates.length; i++) {
            if (dates[i] == date) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            dates.push(date);
        }
        
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, msg.sender);
        
        emit HealthRecordRecorded(msg.sender, date);
    }

    /// @notice 获取健康数据句柄（用于解密）
    /// @param date 日期
    /// @param category 数据类别
    /// @return 加密句柄
    function getHealthDataHandle(uint256 date, uint8 category) external returns (euint16) {
        HealthRecord memory record = healthRecords[msg.sender][date];
        euint16 value;
        
        if (category == 0) {
            value = record.weight;
        } else if (category == 1) {
            value = record.systolicBP;
        } else if (category == 2) {
            value = record.diastolicBP;
        } else if (category == 3) {
            value = record.bloodSugar;
        } else if (category == 5) {
            value = record.heartRate;
        } else {
            revert("Invalid category or use getStepsHandle for steps");
        }
        
        FHE.allowThis(value);
        FHE.allow(value, msg.sender);
        
        return value;
    }

    /// @notice 获取步数句柄（euint32）
    /// @param date 日期
    /// @return 加密句柄
    function getStepsHandle(uint256 date) external returns (euint32) {
        HealthRecord memory record = healthRecords[msg.sender][date];
        FHE.allowThis(record.steps);
        FHE.allow(record.steps, msg.sender);
        return record.steps;
    }

    /// @notice 获取用户所有日期
    /// @return 日期数组
    function getUserDates() external view returns (uint256[] memory) {
        return userDates[msg.sender];
    }

    /// @notice 计算平均值（加密态）
    /// @param dates 日期数组
    /// @param category 数据类别
    /// @return 加密的平均值句柄
    function calculateAverage(
        uint256[] memory dates,
        uint8 category
    ) external returns (euint16) {
        euint16 sum = FHE.asEuint16(0);
        uint256 count = 0;
        
        for (uint i = 0; i < dates.length; i++) {
            HealthRecord memory record = healthRecords[msg.sender][dates[i]];
            
            // Check if record exists (timestamp > 0 means record was created)
            // timestamp is plaintext, so we can check it
            if (record.timestamp == 0) {
                continue; // Skip records that don't exist
            }
            
            euint16 value;
            
            if (category == 0) {
                value = record.weight;
            } else if (category == 1) {
                value = record.systolicBP;
            } else if (category == 2) {
                value = record.diastolicBP;
            } else if (category == 3) {
                value = record.bloodSugar;
            } else if (category == 5) {
                value = record.heartRate;
            } else {
                continue; // Skip invalid categories
            }
            
            sum = FHE.add(sum, value);
            count++;
        }
        
        if (count == 0) {
            euint16 resultAvg = FHE.asEuint16(0);
            FHE.allowThis(resultAvg);
            FHE.allow(resultAvg, msg.sender);
            return resultAvg;
        }
        
        // FHE.div requires plaintext divisor, not encrypted value
        euint16 avg = FHE.div(sum, uint16(count));
        FHE.allowThis(avg);
        FHE.allow(avg, msg.sender);
        
        return avg;
    }

    /// @notice 计算步数平均值（euint32）
    /// @param dates 日期数组
    /// @return 加密的平均值句柄
    function calculateStepsAverage(
        uint256[] memory dates
    ) external returns (euint32) {
        euint32 sum = FHE.asEuint32(0);
        uint256 count = 0;
        
        for (uint i = 0; i < dates.length; i++) {
            HealthRecord memory record = healthRecords[msg.sender][dates[i]];
            sum = FHE.add(sum, record.steps);
            count++;
        }
        
        if (count == 0) {
            euint32 resultAvg = FHE.asEuint32(0);
            FHE.allowThis(resultAvg);
            FHE.allow(resultAvg, msg.sender);
            return resultAvg;
        }
        
        // FHE.div requires plaintext divisor
        euint32 avg = FHE.div(sum, uint32(count));
        FHE.allowThis(avg);
        FHE.allow(avg, msg.sender);
        
        return avg;
    }

    /// @notice 计算趋势（加密态比较）
    /// @param oldDate 旧日期
    /// @param newDate 新日期
    /// @param category 数据类别
    /// @return 加密的布尔值（true=上升, false=下降），前端需要解密
    function calculateTrend(
        uint256 oldDate,
        uint256 newDate,
        uint8 category
    ) external returns (ebool) {
        HealthRecord memory oldRecord = healthRecords[msg.sender][oldDate];
        HealthRecord memory newRecord = healthRecords[msg.sender][newDate];
        
        // Check if records exist (timestamp > 0 means record was created)
        require(oldRecord.timestamp > 0, "HealthRecord not found for oldDate");
        require(newRecord.timestamp > 0, "HealthRecord not found for newDate");
        
        euint16 oldValue;
        euint16 newValue;
        
        if (category == 0) {
            oldValue = oldRecord.weight;
            newValue = newRecord.weight;
        } else if (category == 1) {
            oldValue = oldRecord.systolicBP;
            newValue = newRecord.systolicBP;
        } else if (category == 2) {
            oldValue = oldRecord.diastolicBP;
            newValue = newRecord.diastolicBP;
        } else if (category == 3) {
            oldValue = oldRecord.bloodSugar;
            newValue = newRecord.bloodSugar;
        } else if (category == 5) {
            oldValue = oldRecord.heartRate;
            newValue = newRecord.heartRate;
        } else {
            revert("Invalid category or use calculateStepsTrend for steps");
        }
        
        FHE.allowThis(oldValue);
        FHE.allow(oldValue, msg.sender);
        FHE.allowThis(newValue);
        FHE.allow(newValue, msg.sender);
        
        ebool isRising = FHE.gt(newValue, oldValue);
        FHE.allowThis(isRising);
        FHE.allow(isRising, msg.sender);
        
        return isRising;
    }

    /// @notice 计算步数趋势
    /// @param oldDate 旧日期
    /// @param newDate 新日期
    /// @return 加密的布尔值（true=上升, false=下降），前端需要解密
    function calculateStepsTrend(
        uint256 oldDate,
        uint256 newDate
    ) external returns (ebool) {
        HealthRecord memory oldRecord = healthRecords[msg.sender][oldDate];
        HealthRecord memory newRecord = healthRecords[msg.sender][newDate];
        
        // Check if records exist (timestamp > 0 means record was created)
        require(oldRecord.timestamp > 0, "HealthRecord not found for oldDate");
        require(newRecord.timestamp > 0, "HealthRecord not found for newDate");
        
        FHE.allowThis(oldRecord.steps);
        FHE.allow(oldRecord.steps, msg.sender);
        FHE.allowThis(newRecord.steps);
        FHE.allow(newRecord.steps, msg.sender);
        
        ebool isRising = FHE.gt(newRecord.steps, oldRecord.steps);
        FHE.allowThis(isRising);
        FHE.allow(isRising, msg.sender);
        
        return isRising;
    }

    /// @notice 设置健康目标
    /// @param category 目标类别
    /// @param targetValue 加密的目标值
    /// @param proof 输入证明
    /// @param deadline 截止日期
    function setGoal(
        uint8 category,
        externalEuint16 targetValue,
        bytes calldata proof,
        uint256 deadline
    ) external {
        euint16 encryptedTarget = FHE.fromExternal(targetValue, proof);
        
        goals[msg.sender].push(Goal({
            category: category,
            targetValue: encryptedTarget,
            deadline: deadline,
            active: true
        }));
        
        FHE.allowThis(encryptedTarget);
        FHE.allow(encryptedTarget, msg.sender);
        
        emit GoalSet(msg.sender, goals[msg.sender].length - 1);
    }

    /// @notice 获取活跃目标列表
    /// @return 目标数组
    function getActiveGoals() external view returns (Goal[] memory) {
        Goal[] memory allGoals = goals[msg.sender];
        uint256 activeCount = 0;
        
        // Count active goals
        for (uint i = 0; i < allGoals.length; i++) {
            if (allGoals[i].active) {
                activeCount++;
            }
        }
        
        // Build result array
        Goal[] memory activeGoals = new Goal[](activeCount);
        uint256 index = 0;
        for (uint i = 0; i < allGoals.length; i++) {
            if (allGoals[i].active) {
                activeGoals[index] = allGoals[i];
                index++;
            }
        }
        
        return activeGoals;
    }

    /// @notice 检查目标进度（加密态）
    /// @param goalId 目标ID
    /// @param currentDate 当前日期
    /// @return 进度百分比（加密，0-100）
    function checkGoalProgress(
        uint256 goalId,
        uint256 currentDate
    ) external returns (euint16) {
        Goal memory goal = goals[msg.sender][goalId];
        require(goal.active, "Goal not active");
        
        HealthRecord memory record = healthRecords[msg.sender][currentDate];
        euint16 currentValue;
        
        if (goal.category == 0) {
            currentValue = record.weight;
        } else if (goal.category == 1) {
            currentValue = record.systolicBP;
        } else if (goal.category == 2) {
            currentValue = record.diastolicBP;
        } else if (goal.category == 3) {
            currentValue = record.bloodSugar;
        } else if (goal.category == 5) {
            currentValue = record.heartRate;
        } else {
            revert("Invalid goal category");
        }
        
        // 计算进度：currentValue / targetValue * 100
        // 注意：FHE 不支持两个加密值的除法
        // 返回当前值作为进度指标，前端解密 currentValue 和 targetValue 后计算精确进度
        // 前端计算：Math.min((decryptedCurrent / decryptedTarget) * 100, 100)
        euint16 progress = currentValue;
        
        FHE.allowThis(progress);
        FHE.allow(progress, msg.sender);
        
        emit GoalProgressUpdated(msg.sender, goalId, progress);
        
        return progress;
    }

    /// @notice 停用目标
    /// @param goalId 目标ID
    function deactivateGoal(uint256 goalId) external {
        require(goalId < goals[msg.sender].length, "Goal not found");
        goals[msg.sender][goalId].active = false;
    }

    /// @notice 计算健康评分（加密态）
    /// @param dates 日期数组
    /// @return 加密的评分句柄（euint16格式，前端解密后需要限制在0-100范围）
    /// @dev 返回加密的评分值（avgSteps/100），前端解密后使用 Math.min(decrypted, 100) 限制范围
    /// @dev 注意：此函数不能是 view，因为需要调用 FHE.allow 授权解密和存储评分
    function calculateHealthScore(
        uint256[] memory dates
    ) external returns (euint16) {
        if (dates.length == 0) {
            euint16 emptyScore = FHE.asEuint16(0);
            FHE.allowThis(emptyScore);
            FHE.allow(emptyScore, msg.sender);
            return emptyScore;
        }
        
        // 简化评分算法：基于步数计算（10000 步 = 100 分）
        euint32 totalSteps = FHE.asEuint32(0);
        uint256 count = 0;
        
        for (uint i = 0; i < dates.length; i++) {
            HealthRecord memory record = healthRecords[msg.sender][dates[i]];
            
            // Check if record exists (timestamp > 0)
            if (record.timestamp == 0) {
                continue; // Skip records that don't exist
            }
            
            totalSteps = FHE.add(totalSteps, record.steps);
            count++;
        }
        
        if (count == 0) {
            euint16 resultScore = FHE.asEuint16(0);
            FHE.allowThis(resultScore);
            FHE.allow(resultScore, msg.sender);
            return resultScore;
        }
        
        // FHE.div requires plaintext divisor
        euint32 avgSteps = FHE.div(totalSteps, uint32(count));
        
        // 计算评分：avgSteps / 100 (每 100 步 = 1 分)
        // FHE.div requires plaintext divisor (100 is plaintext)
        euint32 score32 = FHE.div(avgSteps, uint32(100));
        euint32 cappedScore = FHE.min(score32, FHE.asEuint32(100));
        
        // 转换为 euint16（注意：narrowing 会截断）
        euint16 score = FHE.asEuint16(cappedScore);
        
        FHE.allowThis(score);
        FHE.allow(score, msg.sender);
        
        // 存储评分（转换为 euint8，注意：narrowing 会截断）
        healthScores[msg.sender] = FHE.asEuint8(score);
        
        return score;
    }

    /// @notice 风险评估（加密态检测异常值）
    /// @param dates 日期数组
    /// @return 风险等级（加密，0-100，越大风险越高）
    /// @dev 基于血压波动范围计算风险，使用 FHE.select 进行条件选择
    /// @dev 注意：此函数不能是 view，因为需要调用 FHE.allow 授权解密
    function riskAssessment(
        uint256[] memory dates
    ) external returns (euint8) {
        if (dates.length < 2) {
            euint8 lowRisk = FHE.asEuint8(0);
            FHE.allowThis(lowRisk);
            FHE.allow(lowRisk, msg.sender);
            return lowRisk; // 数据不足，无风险
        }
        
        // 简化：基于血压波动检测风险
        // 首先找到第一个有记录的日期作为初始值
        uint256 firstValidIndex = type(uint256).max; // Use max as "not found" marker
        for (uint i = 0; i < dates.length; i++) {
            if (healthRecords[msg.sender][dates[i]].timestamp > 0) {
                firstValidIndex = i;
                break;
            }
        }
        
        // 如果所有日期都没有记录，返回低风险
        if (firstValidIndex == type(uint256).max) {
            euint8 lowRisk = FHE.asEuint8(0);
            FHE.allowThis(lowRisk);
            FHE.allow(lowRisk, msg.sender);
            return lowRisk;
        }
        
        // 计算收缩压的最大值和最小值（使用循环比较）
        euint16 maxBP = healthRecords[msg.sender][dates[firstValidIndex]].systolicBP;
        euint16 minBP = healthRecords[msg.sender][dates[firstValidIndex]].systolicBP;
        uint256 validCount = 1;
        
        for (uint i = firstValidIndex + 1; i < dates.length; i++) {
            HealthRecord memory record = healthRecords[msg.sender][dates[i]];
            
            // Check if record exists (timestamp > 0)
            if (record.timestamp == 0) {
                continue; // Skip records that don't exist
            }
            
            validCount++;
            
            // 使用 FHE.select 选择最大值和最小值
            ebool gtMax = FHE.gt(record.systolicBP, maxBP);
            ebool ltMin = FHE.lt(record.systolicBP, minBP);
            maxBP = FHE.select(gtMax, record.systolicBP, maxBP);
            minBP = FHE.select(ltMin, record.systolicBP, minBP);
        }
        
        // 如果有效记录少于2个，返回低风险
        if (validCount < 2) {
            euint8 lowRisk = FHE.asEuint8(0);
            FHE.allowThis(lowRisk);
            FHE.allow(lowRisk, msg.sender);
            return lowRisk;
        }
        
        euint16 range = FHE.sub(maxBP, minBP);
        
        // 波动范围 > 20 表示高风险
        ebool highRisk = FHE.gt(range, FHE.asEuint16(20));
        
        // 返回风险等级（使用 FHE.select：高风险=80，低风险=20）
        euint8 riskLevel = FHE.select(highRisk, FHE.asEuint8(80), FHE.asEuint8(20));
        
        FHE.allowThis(riskLevel);
        FHE.allow(riskLevel, msg.sender);
        
        return riskLevel;
    }

    /// @notice 授权解密句柄
    /// @param handle 加密句柄
    function allowDecryption(euint16 handle) external {
        FHE.allowThis(handle);
        FHE.allow(handle, msg.sender);
    }

    /// @notice 授权解密步数句柄
    /// @param handle 加密句柄
    function allowStepsDecryption(euint32 handle) external {
        FHE.allowThis(handle);
        FHE.allow(handle, msg.sender);
    }
}

