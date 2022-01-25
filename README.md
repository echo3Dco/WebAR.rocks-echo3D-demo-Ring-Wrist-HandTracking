# Ring-Wrist-Demo
A modification of the [WebAR-rocks/WebAR.rocks.hand](https://github.com/WebAR-rocks/WebAR.rocks.hand) project that demonstrates the use of echo3d platform
to dynamically swap out ring and wrist assets.

## Register
Don't have an API key? Make sure to register for FREE at [echo3D](https://console.echo3D.co/#/auth/register).

## Run
* Clone this repo.
* Unzip the files in Ring-Wrist-Demo/assets/.
* [Upload .glb models](https://docs.echo3D.co/quickstart/add-a-3d-model) to the console.
* [Upload corresponding .csv files to the model entry](https://docs.echo3d.co/web-console/manage-pages/data-page/how-to-add-data#1.-upload-a-metadata-file).
* Set the API key in the Ring-Wrist-Demo/demos/VTO/main.js 
* Host contents of the repository on static server. For my purposes, I used [browsersync](https://browsersync.io/).
* Please refer to [WebAR-rocks/WebAR.rocks.hand](https://github.com/WebAR-rocks/WebAR.rocks.hand#virtual-try-on-and-object-manipulation) for more information 
regarding correctly setting the position of new assets. 
* We chose to adjust the position in blender and then entered the transform data as metadata in the echo3d console.

## Swapping assets
* You can swap out assets by changing the Value of the activeRing or activeWrist to 'true' or 'false' depending on whether that is the asset you want to use.

## Learn more
Refer to our [documentation](https://docs.echo3D.co) to learn more about echo3d.

## Support
Feel free to reach out at [support@echo3D.co](mailto:support@echo3D.co) or join our [support channel on Slack](https://go.echo3D.co/join).

## Screenshots
![Example1](/screenshots/Screenshot2022-01-25111022.png)
![Example2](/screenshots/Screenshot2022-01-25111244.png)
![Example3](/screenshots/Screenshot2022-01-25111447.png)

## Attribution
[Crowned_Ring](https://free3d.com/3d-model/the-crowned-ring-407380.html) asset was found on free3d.com.
[Ring_Ornament](https://free3d.com/3d-model/the-crowned-ring-407380.html) asset was found on free3d.com.
All other 3d assets were included as part of the [WebAR-rocks/WebAR.rocks.hand](https://github.com/WebAR-rocks/WebAR.rocks.hand) project.
