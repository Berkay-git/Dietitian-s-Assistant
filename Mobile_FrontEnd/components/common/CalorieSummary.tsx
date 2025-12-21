import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "../../styles/colors";

interface MacroData {
  consumed: number;
  target: number;
}

interface Props {
  calories: {
    total: number;
    consumed: number;
    remaining: number;
  };
  macros: {
    carb: MacroData;
    protein: MacroData;
    fat: MacroData;
  };
}

export default function CalorieSummary({ calories, macros }: Props) {
  const radius = 50;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const isOverEaten = calories.remaining < 0;
  const ringStrokeColor = isOverEaten ? "#FF9800" : "#4CAF50";

  
  const progress = 
    calories.total> 0
     ? Math.min(calories.consumed / calories.total, 1)
     : 0;

  const strokeDashoffset = circumference - circumference * progress;
  
  const renderMacro = (
    label: string,
    color: string,
    consumed: number,
    target: number
  ) => {
    const percent = 
      target>0
        ? Math.min(consumed / target, 1)
        : 0;      

    return (
      <View style={styles.macroItem}>
        <Text style={styles.macroLabel}>{label}</Text>
        <View style={styles.macroBarBg}>
          <View
            style={[
              styles.macroBarFill,
              { width: `${percent * 100}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={styles.macroValue}>
          {consumed}/{target}g
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* CALORIE RING */}
      <View style={styles.ringContainer}>
        <Svg width={120} height={120}>
          <Circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#7A1C1C"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx="60"
            cy="60"
            r={radius}
            stroke= {ringStrokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin="60,60"
          />
        </Svg>

        <View style={styles.centerText}>
          <Text style={styles.remainingText}>{calories.remaining}</Text>
          <Text style={styles.remainingLabel}>Remaining</Text>
        </View>
      </View>

      {/* MACROS – YAN YANA */}
      <View style={styles.macrosRow}>
        {renderMacro("Carb", "#2ECC71", macros.carb.consumed, macros.carb.target)}
        {renderMacro("Prot", "#E67E22", macros.protein.consumed, macros.protein.target)}
        {renderMacro("Fat", "#F1C40F", macros.fat.consumed, macros.fat.target)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#DDE4E8',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
  },

  ringContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  centerText: {
    position: "absolute",
    alignItems: "center",
  },
  remainingText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
  },
  remainingLabel: {
    fontSize: 11,
    color: "#000000",
  },

  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    width: "30%",
  },
  macroLabel: {
    fontSize: 11,
    color: "#000000",
    marginBottom: 2,
    textAlign: "center",
  },
  macroBarBg: {
    height: 5,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  macroBarFill: {
    height: "100%",
  },
  macroValue: {
    fontSize: 10,
    color: "#000000",
    marginTop: 2,
    textAlign: "center",
  },
});