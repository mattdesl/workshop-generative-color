import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
plt.rcParams["figure.figsize"] = [7.00, 3.50]
plt.rcParams["figure.autolayout"] = True

x_bar = np.array([
  0.048, 0.051, 0.055, 0.060, 0.065, 0.068, 0.068, 0.067, 0.064, 0.062, 0.059, 0.057,
  0.055, 0.054, 0.053, 0.053, 0.052, 0.052, 0.052, 0.053, 0.054, 0.055, 0.057, 0.059,
  0.061, 0.062, 0.065, 0.067, 0.070, 0.072, 0.074, 0.075, 0.076, 0.078, 0.079, 0.082,
  0.087, 0.092, 0.100, 0.107, 0.115, 0.122, 0.129, 0.134, 0.138, 0.142, 0.146, 0.150,
  0.154, 0.158, 0.163, 0.167, 0.173, 0.180, 0.188, 0.196, 0.204, 0.213, 0.222, 0.231,
  0.242, 0.251, 0.261, 0.271, 0.282, 0.294, 0.305, 0.318, 0.334, 0.354, 0.372, 0.392,
  0.409, 0.420, 0.436, 0.450, 0.462, 0.465, 0.448, 0.432, 0.421
])

plt.plot(wavelengths, x_bar, label = 'refl', color='red')
# plt.plot(wavelengths, y_bar, label = 'y', color='green')
# plt.plot(wavelengths, z_bar, label = 'z', color='blue')
# plt.axhline(y=0.0, color='gray', linestyle='dotted')
plt.legend()
plt.show()