# CS 184 Final Project Proposal

# Deep Puppets: Face Expression Transfer for Videos

Andrew Chan<sup>1</sup>, Jaymo Kang<sup>2</sup>, Julia Luo<sup>1</sup>

1:  CS 184/CS 280.

2: CS 280.

## Summary

We propose a full face reenactment program that - given source and target videos of individual actors’ facial expressions - can synthesize a convincing, photo-realistic re-animation of the target actor using the source actor’s 3D head position, rotation, and face expression.

## Problem Overview

Face reenactment is a recent, disruptive application of existing computer vision and graphics techniques where facial expressions are transferred from an actor in a source video to a person in a target video. [Face2Face](https://web.stanford.edu/~zollhoef/papers/CVPR2016_Face2Face/page.html), a CVPR 2016 Oral Presentation from five researchers in three different institutions, attracted considerable media attention when their real-time facial reenactment method was used to transfer facial expressions onto videos of public figures including Putin, Trump, Obama, and Bush. [Deep Video Portraits](https://web.stanford.edu/~zollhoef/papers/SG2018_DeepVideo/page.html), a SIGGRAPH 2018 paper, improved on this method by allowing for transfer from source to target of not only facial expressions, but also 3D head position, rotation, eye gaze, and eye blinking using a novel deep learning-based renderer instead of a compositor in the video synthesis step. 

The above approaches for face reenactment utilize a wide array of vision and graphics algorithms. At a high level, Kim et al.’s approach is the following:

1. Given a source and target video, construct a low-dimensional parametric representation of both videos using monocular face reconstruction.
2. Transfer the head pose and expression from source parameters to target parameters.
3. Render conditioning input images that are converted to a photo-realistic video of the target actor.
![](https://paper-attachments.dropbox.com/s_4753AE1F3F163A8752AEC630ABAF72FC68EF5277FDBE96F176E3613872731FB4_1552811274167_Capture.PNG)


The method can thus be divided into 3 stages: (1) monocular face reconstruction, (2) conditioning input synthesis, and (3) rendering-to-video translation.

**Monocular Face Reconstruction**

3-D Morphable Models are a statistical method from Blanz and Vetter which allow for a decomposition of facial information into a shape and texture vector, allowing for robust mappings of faces onto vector spaces and independent manipulation of various facial attributes. When expressed in Booth et. al’s application, we can first decompose the shape vector $$\mathbf{s} \in \mathbb{R}^{3N}$$, where $$N$$ is the number of 3-d coordinates used in the mesh, and decompose it into a contribution from one’s identity and a contribution from one’s expression. With PCA on neutral face scans, one can procure the identity basis, and use the expression basis to capture the rest of the variation from non-neutral face scans. As a result, we can write a mesh vector as $$\mathbf{s} = \bar{\mathbf{s}} + \mathbf{U}_{id} \mathbf{p} + \mathbf{U}_{ex} \mathbf{q}$$ , where $$\bar{s}$$ represents some mean vector, $$U_{id}$$ are orthogonal (but weighted by singular values) id vectors, $$U_{ex}$$ are orthogonal expression vectors and $$\mathbf{p}, \mathbf{q} \sim \mathcal{N}(0, I)$$. For this basis, we will be using the 3D Basel Face Model from 2009. 

For extracting texture, we will use Trãn et al.'s CNN to extract textures into the same basis as the Basel Face Model. The architecture, as well as the weights, are available online. The camera parameters can also be expressed as a vector $$\mathbf{c}$$ which contains intrinsic camera parameters, three rotation parameters, and three translation parameters. 

TODO: talk about how we’re extracting vectors.


**Conditioning Input Synthesis**

Using our monocular face reconstruction procedure, we can reconstruct the parameterized face in each frame of both the source and target video. Given the source and target face parameters, we can transfer expression and pose from source to target by copying over the parameters in a relative manner. Then we render conditioning images of the target actor’s face using the modified parameters to synthesize and rasterize a morphable model mesh. These images are used as input to our rendering-to-video translation network.

Specifically, for temporal coherence, to generate the $$k$$th frame of our output, we stack the current conditioning image with the last $$N_W$$ rasterized conditioning images $$\{ C_{k-i}|i=0,1,...,N_W \}$$ and use this $$H \times W \times 3N_W$$ (3 channels for each image, and $$N_W$$ images in our sliding window) tensor $$\mathbf{X}$$ as input. 

**Rendering-to-Video Translation**

After obtaining the video frames of our rasterized mesh, our goal is to convert these video frames into our final output video frames, which should resemble our target video. Here we will try a network architecture similar to the Video-to-video synthesis paper from Nvidia<sup>6</sup> (vid2vid). Specifically, given our sequence of ![](https://latex.codecogs.com/png.latex?T) input frames ![](https://latex.codecogs.com/png.latex?%5Cmathbf%7Bs_1%5ET%7D%20%3D%20%5C%7B%5Cmathbf%7Bs_1%7D%2C%20%5Cldots%2C%20%5Cmathbf%7Bs_T%7D%5C%7D) and a sequence of ![T](https://latex.codecogs.com/png.latex?T) target video frames ![target](https://latex.codecogs.com/png.latex?%5Cmathbf%7Bx_1%5ET%7D%20%3D%20%5C%7B%5Cmathbf%7Bx_1%7D%2C%20%5Cldots%2C%20%5Cmathbf%7Bx_T%7D%5C%7D), we want to output reconstructed video frames ![](https://latex.codecogs.com/png.latex?%5Cmathbf%7Bx_1%5ET%27%7D%20%3D%20%5C%7B%5Cmathbf%7Bx_1%27%7D%2C%20%5Cldots%2C%20%5Cmathbf%7Bx_T%27%7D%5C%7D) such that ![](https://latex.codecogs.com/png.latex?%5CPr%28%5Cmathbf%7Bx_1%5ET%27%7D%20%7C%20%5Cmathbf%7Bs_1%5ET%7D%29%20%3D%20%5CPr%28%5Cmathbf%7Bx_1%5ET%7D%7C%5Cmathbf%7Bs_1%5ET%7D%29).

Here, vid2vid uses a conditional Generative Adversarial Network with a single generator ![](https://latex.codecogs.com/png.latex?G) and two conditional discriminators ![](https://latex.codecogs.com/png.latex?D_I) and ![](https://latex.codecogs.com/png.latex?D_V). The generator ![](https://latex.codecogs.com/png.latex?G) produces sequential video frames with a Markov assumption where the current video frame depends on only the past ![](https://latex.codecogs.com/png.latex?L) video frames (they ultimately set ![L=2](https://latex.codecogs.com/png.latex?L%3D2) for their experiments). The discriminator ![](https://latex.codecogs.com/png.latex?D_I) ensures that that our reconstructed video resembles the target video and thus discriminates between image frames in our reconstructed video and those in the original target video (i.e. it outputs 0 for “fake” video frames and 1 for “real” video frames). The discriminator ![](https://latex.codecogs.com/png.latex?D_V) ensures that our reconstructed video has similar temporal dynamics as the original video and discriminates between consecutive frames of the reconstructed video and those of the original video given the optical flow for the past ![](https://latex.codecogs.com/png.latex?K) frames of the original video. Then, they train each discriminator with the generator in the GAN minimax loss, ![](https://latex.codecogs.com/png.latex?%5Cmax_D%7E%5Cmin_G%7E%5Cmathbf%7BE%7D_%7B%5Cmathbf%7Bx_1%5ET%7D%2C%20%5Cmathbf%7Bs_1%5ET%7D%7D%20%5B%5Clog%20D%28%5Cmathbf%7Bx_1%5ET%7D%2C%20%5Cmathbf%7Bs_1%5ET%7D%29%5D%20&plus;%20%5Cmathbf%7BE%7D_%7B%5Cmathbf%7Bs_1%5ET%7D%7D%20%5B%5Clog%281-D%28G%28%5Cmathbf%7Bs_1%5ET%7D%29%2C%20%5Cmathbf%7Bs_1%5ET%7D%29%5D) and find the generator the minimizes the sum of the both discriminator losses as well as a flow estimation loss term.


## Goals and Deliverables

**Planned Goals**

By our end-of-month milestone, we plan to complete:

- A 3D morphable model with parameters for face identity and expression, and a way to generate and rasterize a mesh using a set of morphable model parameters.
- A monocular face reconstruction procedure that can robustly fit identity parameters across an input video and further fit expression and pose parameters for each frame of the video.
- An additional method to fit morphable model texture parameters to an image of a face in our monocular face reconstructor.
- A method to synthesize conditioning inputs for our render-to-video translation network, given a source video and a target video. In particular, given a target video of Russian president Vladimir Putin and a source video of one of us, we want to generate a sequence of conditioning images of Putin’s face rendered with the expressions from our source video.

**Stretch Goals**

- The render-to-video translation network is ultimately a stretch goal, as it is explorative in nature and serves only to convert our sequence of rasterized images into a sequence that resembles our original target video.
- Assuming we have completed the render-to-video translation network, our results should include:
  - Hyperparameter tuning experimentation.
  - Ablation test. Remove certain features of our data and/or training model, possibly including amount of frames in training data, resolution of videos, and conditioning input features.


## Schedule

**4/14** - Complete 3D morphable model with parameters for face identity and expression.

**4/21** - Complete monocular face reconstruction program and successfully fit identity, expression, and texture parameters to an image of Putin. Render resulting mesh and verify it looks reasonable.

**4/24** - Complete `generate_conditioning_images.py` program that can synthesize a sequence of 1000 conditioning images of Putin with modified expressions, given an arbitrary source video and a target video of Putin.

**4/30** - Complete mid-project milestone report.

**5/6** - Complete render-to-video translation network with preliminary results.

**5/14** - Complete final report.


## Resources
1. Kim, Hyeongwoo, et al. ["Deep video portraits.](https://web.stanford.edu/~zollhoef/papers/SG2018_DeepVideo/page.html)” ACM Transactions on Graphics (TOG) 37.4 (2018): 163.
2. Thies, Justus, et al. ["Face2face: Real-time face capture and reenactment of rgb videos."](http://openaccess.thecvf.com/content_cvpr_2016/papers/Thies_Face2Face_Real-Time_Face_CVPR_2016_paper.pdf) Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition. 2016.
3. Zollhöfer, Michael, et al. ["State of the art on monocular 3D face reconstruction, tracking, and applications."](https://web.stanford.edu/~zollhoef/papers/EG18_FaceSTAR/paper.pdf) Computer Graphics Forum. Vol. 37. No. 2. 2018.
4. Paysan, Pascal, et al. ["A 3D face model for pose and illumination invariant face recognition."](https://gravis.dmi.unibas.ch/publications/2009/BFModel09.pdf) 2009 Sixth IEEE International Conference on Advanced Video and Signal Based Surveillance. Ieee, 2009.
5. Tuan Tran, Anh, et al. ["Regressing robust and discriminative 3D morphable models with a very deep neural network."](https://arxiv.org/pdf/1612.04904v1.pdf) Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition. 2017.
6. Wang, Ting-Chun, et al. "Video-to-video synthesis." [arXiv preprint arXiv:1808.06601](https://arxiv.org/abs/1808.06601) (2018).
7. Volker Blanz and Thomas Vetter. 1999. A morphable model for the synthesis of 3D faces. In Proceedings of the 26th annual conference on Computer graphics and interactive techniques (SIGGRAPH '99). ACM Press/Addison-Wesley Publishing Co., New York, NY, USA, 187-194. DOI=http://dx.doi.org/10.1145/311535.311556
8. Pascal Paysan, Reinhard Knothe, Brian Amberg, Sami Romdhani, and Thomas Vetter. 2009. A 3D Face Model for Pose and Illumination Invariant Face Recognition. In *Proceedings of the 2009 Sixth IEEE International Conference on Advanced Video and Signal Based Surveillance* (AVSS '09). IEEE Computer Society, Washington, DC, USA, 296-301. DOI: https://doi.org/10.1109/AVSS.2009.58



