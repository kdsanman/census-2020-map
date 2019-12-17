# census-2020-map
Visualization of response rates in the Tri State Area of NY, CT, and NJ

## To use
You will need a Census Bureau API key, you can get that [here](https://api.census.gov/data/key_signup.html).
You will also need a Google Maps Javascript API key. You can get that following [these](https://developers.google.com/maps/documentation/embed/get-api-key) steps.

Once you have those, you can replace `YOUR-API-KEY` with the corresponding API keys needed. 
The Census Bureau API key goes in the `script.js` file on `line 133`. 
The Google Maps Javascript API Key goes in the `tri_state_area.html` file on `line 83`.


## Why
- The 2020 Census faces the risk of massive undercount, particularly of the populations that need most to be counted.

## The Goal
- Use hierarchical linear regression techniques to establish projected response rates for the 2020 Census during the self-response period.
- Take the difference of the projected rate and the true rate during the self-response period.
- Illustrate, based on this difference, which tracts are responding above or below their projected levels.
- Make the model available to policy makers and community leaders so that those responsible for Get Out the Count campaigns can best allocate time and monetary resources and apply learned lessons from highly responsive tracts to tracts responding below projected levels.
- Agile and flexible response to this knowledge during the self-response period will mitigate ultimate undercount
