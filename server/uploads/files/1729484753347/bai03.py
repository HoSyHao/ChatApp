import numpy as np
import matplotlib.pyplot as plt

np.random.seed(0)
X = np.random.randint(1, 100, 20)
Y = 2 * X + np.random.normal(0, 10, 20)  # Y = 2*X + some noise

# Find the equation of the line
slope, intercept,slope =np.polyfit(X,Y,1)
print(f"Equation of the line: Y = {slope:.2f}*X + {intercept:.2f}") 

# Predict Y for a chosen X value
x1 = 100
y1 = slope * x1 + intercept
print(f"Predicted Y for X={x1} is Y={y1:.2f}")

plt.figure(figsize=(15, 5))

plt.subplot(1,2,1)
# Plot scatter and regression line together
plt.scatter(X,Y, color='blue', label='Data Points')
plt.plot(X, slope * X + intercept, color='red', label='Best-fit line')
plt.xlabel("X")
plt.ylabel("Y")
plt.title("Scatter plot with regression line")
plt.legend()


plt.subplot(1,2,2)
# Highlight the predicted point
plt.scatter(X,Y, color='blue', label='Data Points')
plt.plot(X, slope * X + intercept, color='red', label='Best-fit line')
plt.scatter(x1, y1, color='orange', label=f'Predicted Point ({x1}, {y1:.2f})', zorder=5)
plt.xlabel("X")
plt.ylabel("Y")
plt.title("Scatter plot with regression line and predicted point")
plt.legend()

plt.show()