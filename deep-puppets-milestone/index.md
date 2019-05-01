# Deep Puppets: CS184 Project Milestone

# Summary of Progress

As outlined in our project proposal, a full face reenactment program consists of three components: 1) a monocular face reconstruction algorithm that fits a statistical model of a face to a video of a human subject, 2) generation of training data from fitted face parameters, and 3) training a render-to-video translation network to produce videos from input data. Up until this point we have completed components (1) and (2). Item (3), constructing and training a render-to-video translation network to produce preliminary final results will occupy the second half of our project.


## Monocular face reconstruction

We were able to successfully fit a 3D morphable model to facial images within videos. For an overview of the method, we refer to our [project proposal](http://juliazluo.me/deep-puppets/). We use the Basel Face model from 2009 as our model to fit faces [3]. Using Gauss-Newton Project-Out Optimization as suggested by Booth et. al [1], we find first-order Taylor approximations to the cost function with respect to small changes in the identity vector $$\mathbf{p}$$, the expression vector $$\mathbf{q}$$, and the camera vector $$\mathbf{c}$$ for each frame of the video. As a result of the linearization, we can solve a least-squares problem for the concatenated vector $$\Delta \mathbf{b}^T = [\Delta \mathbf{p}^T \quad \Delta \mathbf{q}^T \quad \Delta\mathbf{c}^T ]$$ minimizing loss. 

We also used Tran et. al’s CNN for regressing texture on the first frame of the video; the fitted texture parameter $$\mathbf{t}$$ is used for the remainder of the video. Additionally, we enforce temporal smoothing across frames for $$\mathbf{q}_i$$ by penalizing its second derivative with respect to time, $$||\mathbf{q}_{i - 1} - \mathbf{q}_i + \mathbf{q}_{i + 1}||^2$$. Booth et. al provide baseline implementations of the fitting algorithms in Python, but omit the essential 3D morphable model component. We use their fitting code with our own 3D morphable model bootstrapped from the Basel Face model data.

# Preliminary Results

We display some preliminary results with our face fitting algorithm on data consisting of a 1 minute long video of Russian president Vladimir Putin giving a speech. Below, the original video, followed by the results of the face fitting procedure run on the first 400 frames.

https://www.dropbox.com/s/zegd33k7gcn7e2h/putin_trimmed.mp4?dl=0

## Face Fitter Results

Video displaying face fitter results here.

https://www.dropbox.com/s/yx0cz1uyke3k8u8/output_putin.mp4?dl=0

# Updated Work Plan
- **5/3** - Complete render-to-video translation network with preliminary results with arbitrary source video and target video of Putin, both 256x256 resolution and with >1000 frames each.
- **5/6** - Create experiment design for evaluating feature importance, model performance, and comparison to other methods.
- **5/10** - Obtain results from running experiments.
- **5/14** - Complete final report.
# Presentation Slides
- Slides are [here](https://docs.google.com/presentation/d/1wTYnFj7GueIIdZznx7TwNP3OmXGL6bzatO8idJZYVvM/edit?usp=sharing)
# References
1. J. Booth *et al*., "3D Reconstruction of “In-the-Wild” Faces in Images and Videos," in *IEEE Transactions on Pattern Analysis and Machine Intelligence*, vol. 40, no. 11, pp. 2638-2652, 1 Nov. 2018. doi: 10.1109/TPAMI.2018.2832138
2. Tuan Tran, Anh, et al. ["Regressing robust and discriminative 3D morphable models with a very deep neural network."](https://arxiv.org/pdf/1612.04904v1.pdf) Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition. 2017.
3. P. Paysan, R. Knothe, B. Amberg, S. Romdhani and T. Vetter, "A 3D Face Model for Pose and Illumination Invariant Face Recognition," *2009 Sixth IEEE International Conference on Advanced Video and Signal Based Surveillance*, Genova, 2009, pp. 296-301. doi: 10.1109/AVSS.2009.58


