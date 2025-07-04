import matplotlib.pyplot as plt
import numpy as np

from pyscript import display

fig, ax = plt.subplots()

# Example data
people = ('Flo A.', 'Ole V.', 'Hannes H.', 'Paul B.', 'Dennis', 'Konrad', 'Nino', 'Flo L.', 'Hannes S.', 'Display')
y_pos = np.arange(len(people))
packs = (10, 10, 3, 7, 4, 0, 14, 5, 2, 24)

ax.barh(y_pos, packs, align='center')
ax.set_yticks(y_pos, labels=people)
ax.invert_yaxis()  # labels read top-to-bottom
ax.set_xlabel('Packs')
ax.set_title('How many packs do you have saved up?')

display(fig, target="mpl")